import os, time

from flask import Flask, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels = ['General']

messages = {}


@app.route("/", methods=['GET', 'POST'])
def index():
    message = ''
    if request.method == 'POST':
        newChannel = request.form.get("newChannel")
        if newChannel not in channels:
            channels.append(newChannel)
        else:
            message = 'Channel already exists!'
    return render_template("index.html", channels=channels, message=message)


@socketio.on('connect')
def test_connect():
    print('User connected!!')


@socketio.on('joinRoom')
def on_join(data):
    username = data['username']
    room = data['channel']
    localtime = time.asctime(time.localtime(time.time()))
    join_room(room)
    emit('message', {'username': 'Flack Bot', 'message': username + ' has joined the chat', 'room': room, 'time': localtime}, room=room, include_self=False)


@socketio.on('leaveRoom')
def on_leave(data):
    username = data['username']
    room = data['channel']
    localtime = time.asctime(time.localtime(time.time()))
    leave_room(room)
    emit('message', {'username': 'Flack Bot', 'message': username + ' has left the chat', 'room': room, 'time': localtime}, room=room, include_self=False)


@socketio.on('getMessages')
def get_msg(data):
    for key, value in messages.items():
        if key == data:
            for items in value:
                print(items)
                emit('message', {'username': items['user'], 'message': items['msg'], 'time': items['time']})

                
@ socketio.on("chatMessage")
def handle_message(data):
    username = data['username']
    msg = data['msg']
    room = data['channel']
    localtime = time.asctime( time.localtime(time.time()) )

    if room not in messages.keys():
        messages[room] = [{'user': username, 'msg': msg, 'time': localtime}]
    else:
        messages[room].append({'user': username, 'msg': msg, 'time': localtime})

    if(len(messages[room]) > 100):
        messages[room].pop(0)
    
    print(localtime)
    emit("message", {'username': username, 'message': msg, 'room': room, 'time': localtime}, room=room)


@socketio.on('disconnect')
def test_disconnect():
    print('User disconnected')

if __name__ == '__main__':
    socketio.run(app)
