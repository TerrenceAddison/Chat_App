import os

from flask import Flask, render_template, url_for,request, session, redirect
from flask_socketio import SocketIO, emit
from userfunctions import User
from channelfunctions import Channel
from flask_session import Session
import datetime


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)
messages = []
allusers = {}
channels = {'main' : {
        'timecreated': datetime.datetime.now(),
        'messages' : []
}}



@app.route("/")
def index():
    print("HERE")
    print(session.get('username'))
    if session.get('username') is not None:
        userChannels = User(session.get('username'),allusers).getUserChannel()
        print(userChannels)
        if 'channelname' in session:
            return redirect(url_for('channel', current_channel=session.get('channelname')))
        return redirect(url_for('channel', current_channel='main'))
    return render_template("homepage.html")

@app.route("/chat", methods = ["POST","GET"])
def chat():
    return render_template("chat.html")

@app.route("/loginproc",methods = ["POST"])
def loginproc():
    username=request.form.get("username")
    user = User(username,allusers).userlogin()
    if user is None:
        return redirect('/')
    return redirect(url_for('channel',current_channel = "main"))

@app.route("/channels/<string:current_channel>")
def channel(current_channel):
    try:
        channellist = User(session.get('username'),allusers).getUserChannel()
        if current_channel in channellist:
            session["channelname"] = current_channel
            return render_template('chat.html',username = session.get('username'),current_channel= current_channel,allchannels=channels, userChannels=channellist,messages=channels[current_channel]['messages'] )
        return render_template('chat.html', username = session.get('username'),current_channel = 'Main',allchannels=channels, userChannels=channellist,messages=channels[current_channel]['messages'])
    except KeyError:
        print(channels)
        return redirect('/')

@app.route('/logout')
def logout():
    session.pop('username',None)
    session.pop('channelname',None)
    return redirect(url_for('index'))


@socketio.on('isTyping')
def isTyping(value):
    emit('isTypingReceiver', {'user': value['user'], 'channel': session.get('channelname')}, broadcast=True)


@socketio.on('isNotTyping')
def isNotTyping(value):
    emit('isNotTypingReceiver', {
         'user': value['user'], 'channel': session.get('channelname')}, broadcast=True)



@socketio.on('newChannel')
def newChannel(value):
    NewChannel = Channel(value['channel'],
                         channels).NewChannel(session.get('username'), allusers)
    if NewChannel is None:
        emit('Receiver', {
             'newChannel': 'null', 'user': session.get('username')}, broadcast=True)
    else:
        emit('Receiver', {
             'newChannel': value['channel'], 'user': session.get('username')}, broadcast=True)

@socketio.on('sendMessage')
def getSendMessage(value):
    messagecontent = {
        'message': value['message'],
        'username': session.get('username'),
        'time': value['time'],
        'channel': value['channel']
    }
    channels[value['channel']]['messages'].append(messagecontent)
    emit('msgreceiver', {'messagecontent': messagecontent}, broadcast=True)


@socketio.on('joinChannel')
def joinChannel(value):
    joinChannel = Channel(value['channel'], channels).joinChannel(
        value['username'], allusers)
    if joinChannel is None:
        emit('joinChannelReceiver', {
             'newChannel': "null", 'user': session.get('username')}, broadcast=True)
    else:
        emit('joinChannelReceiver', {
             'newChannel': value['channel'], 'user': session.get('username')}, broadcast=True)
