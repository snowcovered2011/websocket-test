let express = require('express');
let path = require('path');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

server.listen(9999, () => console.log('服务器已启动，监听端口: 9999'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    })

//在线用户
let onlineUsers = {};
//当前在线人数
let onlineCount = 0;
    //emit方法用于发送消息，on方法用于监听对方发送的消息
io.sockets.on('connect', (socket) => {
    console.log('a user connected');
    //监听新用户加入
	socket.on('login', function(obj){
		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.userid;
		console.log(obj)
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//在线人数+1
			onlineCount++;
		}
		//向所有客户端广播用户加入
		io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
		console.log(obj.username+'加入了聊天室');
	});
    	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var obj = {userid:socket.name, username:onlineUsers[socket.name]};
			//删除
			delete onlineUsers[socket.name];
			//在线人数-1
			onlineCount--;
			//向所有客户端广播用户退出
			io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
			console.log(obj.username+'退出了聊天室');
		}
	});

    //监听用户发布聊天内容
	socket.on('message', function(obj){
		//向所有客户端广播发布的消息
		io.emit('message', obj);
		console.log(obj.username+'说：'+obj.content);
	});

    // socket.emit('news', { test: 'hello world' });
    // socket.on('anotherNews', (data) => {
    //     console.log(data);
    // })
})
