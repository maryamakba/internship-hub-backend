// const express = require('express');
// const router = express.Router();
// const Message = require('../models/Message');

// const {
//     sendMessage,
//     getMessagesBetweenUsers,
//   } = require('../controllers/chatController');
  
//   router.get('/:senderId/:receiverId', getMessagesBetweenUsers);
  

// // Send a message
// router.post('/', async (req, res) => {
//   const { senderId, receiverId, message } = req.body;

//   try {
//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       message,
//     });

//     await newMessage.save();
//     res.status(200).json(newMessage);
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ error: 'Failed to send message' });
//   }
// });

// // Get messages between two users
// router.get('/:user1/:user2', async (req, res) => {
//   const { user1, user2 } = req.params;

//   try {
//     const messages = await Message.find({
//       $or: [
//         { senderId: user1, receiverId: user2 },
//         { senderId: user2, receiverId: user1 },
//       ],
//     });

//     res.status(200).json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { sendMessage, getMessagesBetweenUsers, getMessages } = require('../controllers/chatController');

// // Send a message
// router.post('/', sendMessage);

// // Get messages between two users
// router.get('/:senderId/:receiverId', getMessagesBetweenUsers);

// // Get all messages between sender and receiver
// router.get('/:senderId/:receiverId/all', getMessages);

// module.exports = router;


const {Router} = require('express');
const router = Router();
const main = require('../chatbot');  // Using require instead of import
router.post('/chat', async (req, res) => {
    try{

        const {prompt} = req.body;
        const response= await main(prompt)  // Using require instead of import
         res.status(200).send(response);
    }
    catch(error){
        console.error('Error during content generation:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;
