import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Spin,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { getPCs, addPC, updatePC, deletePC } from "../../api/pcManagerApi";
import SideNavbar from "../../components/common/SideNavbar.jsx";

const PCManager = () => {
  const [pcs, setPCs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadPCs();
  }, []);

  const loadPCs = async () => {
    setLoading(true);
    try {
      const response = await getPCs();
      console.log("API Response:", response); // Debug log

      // Handle different possible response structures
      let data = [];
      if (response?.data?.data) {
        data = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      console.log("Extracted PC data:", data); // Debug log
      setPCs(data);

      if (data.length === 0) {
        message.info("No PCs found");
      }
    } catch (err) {
      console.error("Error loading PCs:", err);
      message.error("Failed to load PCs.");
      setPCs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setActionLoading(true);
    try {
      if (editId) {
        await updatePC(editId, values);
        message.success("PC updated successfully");
      } else {
        await addPC(values);
        message.success("PC added successfully");
      }
      form.resetFields();
      setEditId(null);
      setModalVisible(false);
      await loadPCs(); // Wait for reload to complete
    } catch (err) {
      console.error("Error submitting PC form:", err);
      message.error("An error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      address: record.address,
      fee: record.fee,
    });
    setEditId(record.id);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete PC",
      content: "Are you sure you want to delete this PC?",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deletePC(id);
          message.success("PC deleted successfully");
          await loadPCs(); // Wait for reload to complete
        } catch (err) {
          console.error("Error deleting PC:", err);
          message.error("Failed to delete PC.");
        }
      },
    });
  };

  // Search across Name, Address, Fee
  const filteredPCs = searchText
    ? pcs.filter((pc) =>
        ["name", "address", "fee"].some((key) => {
          const value = pc[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchText.toLowerCase())
          );
        })
      )
    : pcs;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => a.address.localeCompare(b.address),
    },
    {
      title: "Fee",
      dataIndex: "fee",
      key: "fee",
      render: (fee) => `৳${parseFloat(fee).toFixed(2)}`,
      sorter: (a, b) => parseFloat(a.fee) - parseFloat(b.fee),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            onClick={() => handleEdit(record)}
            disabled={actionLoading}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            type="danger"
            size="small"
            onClick={() => handleDelete(record.id)}
            disabled={actionLoading}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const dataSource = searchText ? filteredPCs : pcs;

  return (
    <div className="flex h-screen bg-gray-50">
      <SideNavbar />
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            PC Management
          </h1>

          {/* Search + Add button */}
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by name, address, or fee..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setEditId(null);
                setModalVisible(true);
              }}
              disabled={loading}
            >
              Add PC
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 bg-white rounded shadow">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Spin size="large" />
            </div>
          ) : dataSource.length === 0 ? (
            <Empty
              description={
                searchText ? "No PCs match your search" : "No PCs found"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              dataSource={dataSource}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} PCs`,
              }}
              bordered
              scroll={{ x: 600 }}
              loading={actionLoading}
            />
          )}
        </div>

        {/* Modal */}
        <Modal
          title={editId ? "Edit PC" : "Add PC"}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditId(null);
          }}
          onOk={() => form.submit()}
          okText={editId ? "Update" : "Add"}
          confirmLoading={actionLoading}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            preserve={false}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please enter PC name" },
                { min: 2, message: "Name must be at least 2 characters" },
                { max: 100, message: "Name cannot exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter PC name" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please enter PC address" },
                { min: 5, message: "Address must be at least 5 characters" },
                { max: 200, message: "Address cannot exceed 200 characters" },
              ]}
            >
              <Input.TextArea
                placeholder="Enter PC address"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              label="Fee"
              name="fee"
              rules={[
                { required: true, message: "Please enter fee" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid fee amount",
                },
              ]}
            >
              <Input
                placeholder="Enter fee amount"
                prefix="৳"
                type="number"
                min="0"
                step="0.01"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default PCManager;
