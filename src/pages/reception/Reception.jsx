import { useState, useEffect } from "react";
import { Table, Modal, Form, Input, Button, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  getReceptions,
  updateReception,
  deleteReception,
} from "../../api/receptionService";
import { register } from "../../api/authService";
import "./Reception.css";
import SideNavbar from "../../components/common/SideNavbar";

const Reception = () => {
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReception, setEditingReception] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchReceptions();
  }, []);

  const fetchReceptions = async () => {
    setLoading(true);
    try {
      const res = await getReceptions();
      setReceptions(res); // <-- FIX: res is already an array
    } catch (err) {
      message.error("Failed to load receptions");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReception(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingReception(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      password: "", // reset password optional
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteReception(id);
      message.success("Receptionist deleted");
      fetchReceptions();
    } catch (err) {
      message.error("Delete failed");
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingReception) {
        // Update existing
        await updateReception(editingReception.id, {
          username: values.username,
          email: values.email,
          ...(values.password ? { password: values.password } : {}),
        });
        message.success("Receptionist updated");
      } else {
        // Create new
        await register({ ...values, role: "reception" });
        message.success("Receptionist added");
      }

      setIsModalOpen(false);
      fetchReceptions();
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Operation failed");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this receptionist?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="flex h-screen">
      <SideNavbar />
      <div className="register-container">
        <div
          className="register-card"
          style={{ width: "80%", maxWidth: "900px" }}
        >
          <h2 className="register-title">Reception Management</h2>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ marginBottom: 16 }}
          >
            Add Receptionist
          </Button>

          <Table
            dataSource={receptions}
            columns={columns}
            rowKey="id"
            loading={loading}
          />

          <Modal
            title={editingReception ? "Edit Receptionist" : "Add Receptionist"}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={() => setIsModalOpen(false)}
            okText={editingReception ? "Update" : "Create"}
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please enter username" }]}
              >
                <Input placeholder="Username" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Enter valid email" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  editingReception ? "New Password (optional)" : "Password"
                }
                rules={
                  editingReception
                    ? []
                    : [{ required: true, message: "Please enter password" }]
                }
              >
                <Input.Password placeholder="••••••••" />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Reception;
