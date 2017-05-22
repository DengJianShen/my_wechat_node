#个人微信测试号对接微信api  
#需开启mongodb:27017，否则node app报错；需开启ngrok将内网映射到外网  

#关于ngrok  
1.可使用npm全局安装一个localtunnel,映射1234的端口号    
#npm install -g localtunnel  
#lt --subdomain djshen --port 1234  
2.可使用国内的Sunny-ngrok  Sunny ngrok：./sunny clientid xxxxxx  
3.可使用国内的http://ngrok.2bdata.com/  
4.可使用国外的https://ngrok.com/  ./ngrok http 1234  

#git clone https://github.com/DengJianShen/my_wechat_node.git    
#cd my_wechat_node  
#npm install  
#node app  
#访问http://localhost:1234/admin/signup