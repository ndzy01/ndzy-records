import { initCloud } from '@wxcloud/cloud-sdk';
import { isEmpty } from 'lodash';
import { message } from 'antd';

const cloud = initCloud();
const c = cloud.Cloud({
  identityless: true,
  // 资源方 AppID
  resourceAppid: 'wxf18966ace3bbbd97',
  // 资源方环境 ID
  resourceEnv: 'prod-3gjeiq7x1fbed11e',
  // ----
});
c.init();

// 处理 get 请求参数
export const objectToQueryString = (obj: any) => {
  return Object.keys(obj)
    .map((key) => (obj[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}` : ''))
    .filter((item) => item)
    .join('&');
};

export const service = (options: {
  url: string;
  method: 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | 'PATCH' | undefined;
  data?: any;
  params?: any;
}) => {
  const { url = '', data = {}, params = {} } = options;
  let path = url;
  const token = localStorage.getItem('token');
  const header: any = {
    'X-WX-SERVICE': 'ndzy-service',
  };

  if (token) {
    header.Authorization = 'Basic' + ' ' + token;
  }

  if (options.method === 'GET' && !isEmpty(params)) {
    path += '?' + objectToQueryString(params);
  }

  return new Promise((resolve, reject) => {
    c.callContainer({
      ...options,
      config: {
        env: 'prod-3gjeiq7x1fbed11e',
      },
      path,
      header,
      method: options.method,
      data,
    })
      .then((res: { data: any; code: number; msg: string }) => {
        if (res.data.status === 1) {
          message.error(res.data.msg);
        }

        if (res.data.status === 0) {
          message.success(res.data.msg);
        }

        resolve(res.data);
      })
      .catch(() => {
        reject('网络错误');
      });
  });
};
