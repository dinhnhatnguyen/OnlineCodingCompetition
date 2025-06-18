import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Table, message, Popconfirm, Space, Tag } from 'antd';
import { 
  TranslationOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  GlobalOutlined 
} from '@ant-design/icons';
import { 
  getAvailableLanguages, 
  batchTranslateProblems, 
  deleteTranslation,
  createOrUpdateTranslation 
} from '../../api/problemsApi';
import { getProblems } from '../../api/problemsApi';

const { Option } = Select;

const TranslationManager = () => {
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('vi');
  const [translationStats, setTranslationStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [problemsData, languagesData] = await Promise.all([
        getProblems('en'), // Get original problems
        getAvailableLanguages()
      ]);
      
      setProblems(problemsData);
      setAvailableLanguages(languagesData);
      
      // Calculate translation stats
      const stats = {};
      languagesData.forEach(lang => {
        if (lang !== 'en') {
          stats[lang] = problemsData.length; // Assume all can be translated
        }
      });
      setTranslationStats(stats);
      
    } catch (error) {
      message.error('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTranslate = async () => {
    if (!selectedLanguage) {
      message.warning('Please select a language');
      return;
    }

    try {
      setLoading(true);
      message.loading('Starting batch translation...', 0);
      
      await batchTranslateProblems(selectedLanguage);
      
      message.destroy();
      message.success(`Successfully started batch translation to ${selectedLanguage}`);
      
      // Refresh data
      await fetchData();
      
    } catch (error) {
      message.destroy();
      message.error('Failed to start batch translation');
      console.error('Batch translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTranslation = async (problemId, language) => {
    try {
      await deleteTranslation(problemId, language);
      message.success('Translation deleted successfully');
      await fetchData();
    } catch (error) {
      message.error('Failed to delete translation');
      console.error('Delete translation error:', error);
    }
  };

  const handleCreateTranslation = async (problemId, language) => {
    try {
      setLoading(true);
      await createOrUpdateTranslation(problemId, language);
      message.success('Translation created successfully');
      await fetchData();
    } catch (error) {
      message.error('Failed to create translation');
      console.error('Create translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Problem ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty) => {
        const color = difficulty === 'EASY' ? 'green' : 
                    difficulty === 'MEDIUM' ? 'orange' : 'red';
        return <Tag color={color}>{difficulty}</Tag>;
      }
    },
    {
      title: 'Available Languages',
      key: 'languages',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          <Tag color="blue">EN</Tag>
          {availableLanguages
            .filter(lang => lang !== 'en')
            .map(lang => (
              <Tag key={lang} color="green">
                {lang.toUpperCase()}
              </Tag>
            ))
          }
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          {availableLanguages
            .filter(lang => lang !== 'en')
            .map(lang => (
              <Space key={lang} direction="vertical" size="small">
                <Button
                  size="small"
                  icon={<TranslationOutlined />}
                  onClick={() => handleCreateTranslation(record.id, lang)}
                  title={`Translate to ${lang}`}
                >
                  {lang.toUpperCase()}
                </Button>
                <Popconfirm
                  title={`Delete ${lang} translation?`}
                  onConfirm={() => handleDeleteTranslation(record.id, lang)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    title={`Delete ${lang} translation`}
                  />
                </Popconfirm>
              </Space>
            ))
          }
        </Space>
      )
    }
  ];

  return (
    <div className="translation-manager">
      <Card 
        title={
          <Space>
            <GlobalOutlined />
            Translation Management
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        {/* Batch Translation Controls */}
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="mb-3">Batch Translation</h3>
          <Space>
            <Select
              placeholder="Select target language"
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              style={{ width: 200 }}
            >
              {availableLanguages
                .filter(lang => lang !== 'en')
                .map(lang => (
                  <Option key={lang} value={lang}>
                    {lang === 'vi' ? 'Vietnamese' : lang.toUpperCase()}
                  </Option>
                ))
              }
            </Select>
            <Button
              type="primary"
              icon={<TranslationOutlined />}
              onClick={handleBatchTranslate}
              loading={loading}
              disabled={!selectedLanguage}
            >
              Translate All Problems
            </Button>
          </Space>
          
          {/* Translation Stats */}
          <div className="mt-3">
            <h4>Translation Statistics:</h4>
            <Space wrap>
              {Object.entries(translationStats).map(([lang, count]) => (
                <Tag key={lang} color="blue">
                  {lang.toUpperCase()}: {count} problems
                </Tag>
              ))}
            </Space>
          </div>
        </div>

        {/* Problems Table */}
        <Table
          columns={columns}
          dataSource={problems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} problems`
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default TranslationManager;
