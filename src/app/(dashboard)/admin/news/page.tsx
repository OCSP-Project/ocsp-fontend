"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  DatePicker,
  Typography,
  Row,
  Col,
  Tabs,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { News, CreateNewsDto, UpdateNewsDto, ScheduleNewsDto } from "@/types/news";
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
  unpublishNews,
  scheduleNews,
} from "@/lib/api/news";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";

const { Title } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminNewsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [schedulingNews, setSchedulingNews] = useState<News | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [imageLinks, setImageLinks] = useState<string>("");

  useEffect(() => {
    fetchNews();
  }, [activeTab]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      let isPublished: boolean | undefined = undefined;
      if (activeTab === "published") isPublished = true;
      if (activeTab === "unpublished") isPublished = false;

      const data = await getAllNews(isPublished, 1, 100);
      setNews(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      message.error("Không thể tải danh sách tin tức");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNews(null);
    form.resetFields();
    setImageLinks("");
    setIsModalVisible(true);
  };

  const handleEdit = (record: News) => {
    setEditingNews(record);
    form.setFieldsValue({
      title: record.title,
      author: record.author,
      contentNews: record.contentNews,
      originalLink: record.originalLink,
      isFeatured: record.isFeatured,
      category: record.category,
      tags: record.tags,
      publishImmediately: false,
    });
    setImageLinks(record.imageLinks.join("\n"));
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const imageLinksArray = imageLinks
        .split("\n")
        .map((link) => link.trim())
        .filter((link) => link.length > 0);

      if (editingNews) {
        const dto: UpdateNewsDto = {
          title: values.title,
          author: values.author,
          contentNews: values.contentNews,
          originalLink: values.originalLink,
          isFeatured: values.isFeatured,
          category: values.category,
          tags: values.tags,
          imageLinks: imageLinksArray,
        };
        await updateNews(editingNews.id, dto);
        message.success("Cập nhật tin tức thành công");
      } else {
        const dto: CreateNewsDto = {
          title: values.title,
          author: values.author,
          contentNews: values.contentNews,
          originalLink: values.originalLink,
          publishImmediately: values.publishImmediately || false,
          isFeatured: values.isFeatured || false,
          category: values.category,
          tags: values.tags,
          imageLinks: imageLinksArray,
        };
        await createNews(dto);
        message.success("Tạo tin tức thành công");
      }
      setIsModalVisible(false);
      fetchNews();
    } catch (error) {
      console.error("Failed to save news:", error);
      message.error("Không thể lưu tin tức");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      message.success("Xóa tin tức thành công");
      fetchNews();
    } catch (error) {
      console.error("Failed to delete news:", error);
      message.error("Không thể xóa tin tức");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishNews(id);
      message.success("Xuất bản tin tức thành công");
      fetchNews();
    } catch (error) {
      console.error("Failed to publish news:", error);
      message.error("Không thể xuất bản tin tức");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishNews(id);
      message.success("Gỡ xuất bản tin tức thành công");
      fetchNews();
    } catch (error) {
      console.error("Failed to unpublish news:", error);
      message.error("Không thể gỡ xuất bản tin tức");
    }
  };

  const handleSchedule = (record: News) => {
    setSchedulingNews(record);
    scheduleForm.resetFields();
    setIsScheduleModalVisible(true);
  };

  const handleScheduleSubmit = async (values: any) => {
    if (!schedulingNews) return;

    try {
      setSubmitting(true);
      const dto: ScheduleNewsDto = {
        scheduledPublishAt: values.scheduledPublishAt.toISOString(),
      };
      await scheduleNews(schedulingNews.id, dto);
      message.success("Lên lịch xuất bản thành công");
      setIsScheduleModalVisible(false);
      fetchNews();
    } catch (error) {
      console.error("Failed to schedule news:", error);
      message.error("Không thể lên lịch xuất bản");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ColumnsType<News> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 300,
      ellipsis: true,
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span className="font-semibold">{text}</span>
          {record.isFeatured && (
            <Tag color="gold" icon={<CheckCircleOutlined />}>
              Nổi bật
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageLinks",
      key: "imageLinks",
      width: 100,
      render: (imageLinks: string[]) => (
        imageLinks.length > 0 && (
          <Image
            src={imageLinks[0]}
            alt="Preview"
            width={80}
            height={60}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        )
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 120,
      render: (isPublished: boolean, record: News) => (
        <Space direction="vertical" size="small">
          {isPublished ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Đã xuất bản
            </Tag>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              Chưa xuất bản
            </Tag>
          )}
          {record.scheduledPublishAt && (
            <Tag color="blue" icon={<ClockCircleOutlined />}>
              {dayjs(record.scheduledPublishAt).format("DD/MM HH:mm")}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 100,
      render: (count: number) => (
        <Space>
          <EyeOutlined />
          {count}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_, record: News) => (
        <Space>
          {!record.isPublished ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handlePublish(record.id)}
            >
              Xuất bản
            </Button>
          ) : (
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleUnpublish(record.id)}
            >
              Gỡ xuất bản
            </Button>
          )}
          <Button
            size="small"
            icon={<ClockCircleOutlined />}
            onClick={() => handleSchedule(record)}
          >
            Lên lịch
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tin tức?"
            description="Bạn có chắc muốn xóa tin tức này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div className="p-6">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={2}>Quản lý tin tức</Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchNews}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Tạo tin tức
              </Button>
            </Space>
          </Col>
        </Row>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Tất cả" key="all" />
            <TabPane tab="Đã xuất bản" key="published" />
            <TabPane tab="Chưa xuất bản" key="unpublished" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={news}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Tổng ${total} tin tức`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          title={editingNews ? "Sửa tin tức" : "Tạo tin tức mới"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề tin tức" />
            </Form.Item>

            <Form.Item
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: "Vui lòng nhập tác giả" }]}
            >
              <Input placeholder="Nhập tên tác giả" />
            </Form.Item>

            <Form.Item name="contentNews" label="Nội dung" rules={[{ required: true }]}>
              <TextArea rows={10} placeholder="Nhập nội dung tin tức" />
            </Form.Item>

            <Form.Item label="Link hình ảnh (mỗi link một dòng)">
              <TextArea
                rows={4}
                value={imageLinks}
                onChange={(e) => setImageLinks(e.target.value)}
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="Danh mục">
                  <Input placeholder="Ví dụ: Xây dựng, Nội thất" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tags" label="Tags (phân cách bằng dấu phẩy)">
                  <Input placeholder="tag1, tag2, tag3" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="originalLink" label="Link gốc">
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item name="isFeatured" label="Tin nổi bật" valuePropName="checked">
              <Switch />
            </Form.Item>

            {!editingNews && (
              <Form.Item
                name="publishImmediately"
                label="Xuất bản ngay"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingNews ? "Cập nhật" : "Tạo"}
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Schedule Modal */}
        <Modal
          title="Lên lịch xuất bản"
          open={isScheduleModalVisible}
          onCancel={() => setIsScheduleModalVisible(false)}
          footer={null}
        >
          <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleSubmit}>
            <Form.Item
              name="scheduledPublishAt"
              label="Thời gian xuất bản"
              rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder="Chọn ngày và giờ"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Lên lịch
                </Button>
                <Button onClick={() => setIsScheduleModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
};

export default AdminNewsPage;
