import { toast } from './Helper';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import Constant from './Constant';
import Url from './Url';



export const axiosRequest = async (url: string, method: string, params: any = "") => {
    console.log(url,method);
    

    const axiosConfig = axios.create({
        baseURL: Url.HOST_URL,
        timeout: 10000,
    });
    // axiosConfig.interceptors.request.use(function (config) {
    //     const token = store.getState()?.user?.userData?.token;
    //     config.headers.Authorization = `Bearer ${token}`;
    //     return config;
    // });


    axiosConfig.interceptors.response.use((response) => {
        // console.log("-----------response-----------");
        // console.log(JSON.stringify(response.data, null, 1));
        // console.log("-----------response-----------");

        if (response?.config?.parse) {
            //perform the manipulation here and change the response object
        }
        return response;
    }, (error) => {
        return Promise.reject(error.message);
    });



    switch (method) {
        case Constant.API_REQUEST_METHOD.GET:
            let data = "?";
            let finalUrl = "";
            if (params != "") {
                for (let k in params) {
                    data += `${k}=${params[k]}&`;
                }
                finalUrl = url + data.slice(0, -1);
            } else {
                finalUrl = url;
            }
            console.log({ finalUrl });

          
            return axiosConfig.get(finalUrl).then(res => {
                console.log(finalUrl);
                
                    return res;
              
            }).catch(err => {
                console.log(err)
                return err;
            })


        case Constant.API_REQUEST_METHOD.POST:

        console.log({ url,params });
            return axiosConfig.post(url, params).then(res => {
                return res;
            }).catch(err => {
                console.log(err)
                return err;
            })
    }


}

export function postUrlEncoded(url: string, params: any) {
    return new Promise(function (resolve, reject) {
        const urlencoded = new URLSearchParams();
        for (let k in params) {
            urlencoded.append(k, params[k]);
        }
        NetInfo.fetch().then(status => {
            if (status.isConnected) {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: urlencoded.toString(),
                })
                    .then(response => response.json())
                    .then(result => {
                        let type = typeof result;
                        if (type === 'string') {
                            let data = { Msz: result };
                            resolve(data)
                        } else {
                            resolve(result)
                        }
                    })
                    .catch(error => {
                        console.log(error);
                        toast("Something Wrong with Fetch");
                        reject(new Error(error));
                    })
            } else {
                toast("You are not connected to Internet");
                reject(new Error("You are not connected to Internet"));
            }
        }).catch(error => {
            reject(new Error(error));
        });
    })
}


export function getUrl(url: string, params: any = "") {

    return new Promise(function (resolve, reject) {
        let data = "?";
        let finalUrl = "";
        if (params != "") {
            for (let k in params) {
                data += `${k}=${params[k]}&`;
            }
            finalUrl = url + data.slice(0, -1);
        } else {
            finalUrl = url;
        }
        console.log({ finalUrl });

        NetInfo.fetch().then(status => {
            if (status.isConnected) {
                fetch(finalUrl)
                    .then(response => response.json())
                    .then(result => {
                        console.log({ result })
                        resolve(result)
                    })
                    .catch(error => {
                        console.log(error);
                        toast("Something Wrong with Fetch");
                        reject(new Error(error));
                    })
            } else {
                toast("You are not connected to Internet");
                reject(new Error("You are not connected to Internet"));
            }
        }).catch(error => {
            reject(new Error(error));
        });
    })
}


