#!/usr/bin/env python3
"""Local preview server. Not used in production."""
import http.server
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
http.server.test(HandlerClass=http.server.SimpleHTTPRequestHandler, port=8080, bind=None)
