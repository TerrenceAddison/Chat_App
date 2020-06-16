from flask import Flask, session

class User():
    def __init__(self, username, allusers):
        self.username = username
        self.allusers = allusers

    def userlogin(self):
        if self.username in self.allusers:
            session['username'] = self.username
            return self.username
        self.allusers[self.username] = {
            'username': self.username,
            'channels': ['main']
        }
        session['username'] = self.username
        return self.username
    def getUserChannel(self):
        return self.allusers[self.username]['channels']