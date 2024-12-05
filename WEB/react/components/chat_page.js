import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const usr = 'nava';

function ChatPage() {
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:1200'); // Connect to the backend

    // Fetch data from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:1200/api/users/${usr}`);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    // Initial data fetch
    fetchData();

    // Listen for the "processCompleted" event
    socket.on('processCompleted', ({ user }) => {
      if (user === usr) {
        console.log(`Update detected for user: ${usr}`);
        fetchData(); // Re-fetch data from the API dynamically
      }
    });

    return () => {
      socket.disconnect(); // Cleanup on component unmount
    };
  }, []);

  // Send a message to the server
  const sendMessage = () => {
    const socket = io('http://localhost:1200'); // Change this to match your backend URL
    socket.emit('chats', {
      sender: usr,
      reciver: 'olivea',
      body: message,
      sends: false,
      seen: false,
      created: Date.now(),
    });
    setMessage(''); // Clear the input field after sending
  };

  return ( 
    <>
      <div>
        <h1>Messages</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {data.map((item) => (
              <li
                key={item._id}
                style={{
                  textAlign: item.sents ? 'right' : item.receiving ? 'left' : 'center',
                }}
              >
                {item.sents ? (
                  <>
                    <span style={{ color: 'red' }}>{item.sents.body}</span>
                  </>
                ) : item.receiving ? (
                  <>
                    <span style={{ color: 'blue' }}>{item.receiving.body}</span>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="App">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </>
  );
}

export default ChatPage;
