# from flask import Flask, request
# from flask_cors import CORS, cross_origin

 
# app = Flask(__name__)
# cors = CORS(app, origins='*')

# @cross_origin()
# @app.route('/api/chat', methods=['POST'])
# def chat():
#    question = request.json['Question']
#    data = {
#         'name': question,
#         'age': 10,
#         'hobbies': ['searching', 'chatting', 'learning']
#     }
#    return(data)
 
# if __name__ == '__main__':
#     app.run(debug=True, port="5000")