//import request from '../utils/request';
import request from '../utils/websocket';


export const fetchData = query => {
    return request({
        url: './table.json',
        method: 'get',
        params: query
    });
};
