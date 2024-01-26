import { useMount, useSetState, useSize } from 'ahooks';
import { Button, Popconfirm, Table, List, Typography, Form, Input } from 'antd';
import type { TableProps } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useRef } from 'react';
import { service } from './http';
import { decrypt, encrypt } from './utils';

const { Paragraph } = Typography;
const App = () => {
  const [form] = Form.useForm();
  const ContainerHeight = 600;
  const ref = useRef(null);
  const size = useSize(ref);
  const [s, setS] = useSetState<{ list: any[]; loading: boolean }>({ list: [], loading: false });

  const query = (params: any = {}) => {
    setS({ loading: true });
    service({ url: '/records', method: 'GET', params })
      .then((res: any) => {
        form.setFieldsValue({ name: '', txt: '', txtInfo: '' });
        setS({
          list: res.data.map((item: any) => ({
            ...item,
            txt: decrypt(item.txt, item.keyBase, item.ivBase),
          })),
          loading: false,
        });
      })
      .catch(() => {
        setS({ loading: false });
      });
  };

  const del = (id: string) => {
    setS({ loading: true });
    service({ url: `/records/${id}`, method: 'DELETE' })
      .then(() => {
        query();
      })
      .catch(() => {
        setS({ loading: false });
      });
  };

  const add = (values: any) => {
    setS({ loading: true });
    const { text, keyBase, ivBase } = encrypt(values.txt);
    service({
      url: '/records',
      method: 'POST',
      data: {
        ...values,
        txt: text,
        keyBase,
        ivBase,
      },
    })
      .then(() => {
        query();
      })
      .catch(() => {
        setS({ loading: false });
      });
  };

  useMount(() => {
    query();
  });

  const columns: TableProps<any>['columns'] = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 60,
      render: (t) => <Paragraph copyable>{t}</Paragraph>,
    },

    {
      title: 'txt',
      dataIndex: 'txt',
      width: 120,
      render: (t) => <Paragraph copyable>{t}</Paragraph>,
    },
    {
      title: '描述',
      dataIndex: 'txtInfo',
      width: 20,
    },
    {
      title: '操作',
      width: 20,
      fixed: 'right',
      render: (_text, record: any) => (
        <Popconfirm title="删除将无法恢复,确定删除?" onConfirm={() => del(record.id)}>
          <Button type="link"> 删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div ref={ref} style={{ height: '100%' }}>
      <Form onFinish={add} form={form}>
        <Form.Item label="name" name="name" rules={[{ required: true, message: '不能为空' }]}>
          <Input.TextArea placeholder="请输入" />
        </Form.Item>

        <Form.Item label="txt" name="txt" rules={[{ required: true, message: '不能为空' }]}>
          <Input.TextArea placeholder="请输入" />
        </Form.Item>

        <Form.Item label="txtInfo" name="txtInfo">
          <Input.TextArea placeholder="请输入" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={s.loading}>
            添加
          </Button>
        </Form.Item>
      </Form>

      {Number(size?.width) > 800 ? (
        <Table
          loading={s.loading}
          virtual
          columns={columns}
          scroll={{ x: 800, y: 600 }}
          rowKey="id"
          dataSource={s.list}
          pagination={false}
          locale={{ emptyText: <div className="center">暂无记录</div> }}
        />
      ) : (
        <List loading={s.loading}>
          <VirtualList data={s.list} height={ContainerHeight} itemHeight={40} itemKey="id">
            {(item) => (
              <List.Item
                key={item.id}
                actions={[
                  <Popconfirm title="删除将无法恢复,确定删除?" onConfirm={() => del(item.id)}>
                    <Button type="link"> 删除</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta title={<Paragraph copyable>{item.name}</Paragraph>} description={item.txtInfo} />
                <Paragraph copyable>{item.txt}</Paragraph>
              </List.Item>
            )}
          </VirtualList>
        </List>
      )}
    </div>
  );
};

export default App;
