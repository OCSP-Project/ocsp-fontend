// src/components/features/contractors/components/ContractorPosts/ContractorPostForm.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Upload, Button, Modal, Space } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload";
import { gsap } from "gsap";
import styles from "./ContractorPosts.module.scss";

interface ContractorPostFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    files?: File[];
  }) => Promise<void>;
  submitting?: boolean;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;

const ContractorPostForm: React.FC<ContractorPostFormProps> = ({
  visible,
  onClose,
  onSubmit,
  submitting,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { autoAlpha: 0, y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [visible]);

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith("image/");
    const isLtSize = file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;
    if (!isImage) {
      Modal.error({
        title: "Tệp không hợp lệ",
        content: "Chỉ hỗ trợ tải ảnh.",
      });
      return Upload.LIST_IGNORE;
    }
    if (!isLtSize) {
      Modal.error({
        title: "Ảnh quá lớn",
        content: `Kích thước tối đa ${MAX_FILE_SIZE_MB}MB/ảnh.`,
      });
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= MAX_FILES) {
      Modal.warning({
        title: "Quá số lượng ảnh",
        content: `Tối đa ${MAX_FILES} ảnh.`,
      });
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const files = fileList
        .map((f) => f.originFileObj)
        .filter(Boolean) as File[];
      await onSubmit({
        title: values.title,
        description: values.description,
        files,
      });
      form.resetFields();
      setFileList([]);
    } catch {
      // validation handled by antd
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Đăng bài"
      cancelText="Hủy"
      confirmLoading={submitting}
      width={700}
      className={styles.postModal}
      destroyOnClose
    >
      <div ref={modalRef}>
        <Form layout="vertical" form={form} className={styles.postForm}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input
              placeholder="Nhập tiêu đề bài đăng"
              maxLength={150}
              showCount
            />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Mô tả chi tiết..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
          <Form.Item label="Ảnh (tùy chọn)">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                return true;
              }}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess && onSuccess("ok");
                }, 0);
              }}
              onChange={({ fileList: newList }) => setFileList(newList)}
            >
              {fileList.length >= MAX_FILES ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <Space size="small" className={styles.uploadHint}>
              <UploadOutlined />
              <span>
                Tối đa {MAX_FILES} ảnh, ≤ {MAX_FILE_SIZE_MB}MB/ảnh
              </span>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ContractorPostForm;
