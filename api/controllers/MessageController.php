<?php
class MessageController {
    // Database connection
    private $db;
    private $message;
    
    // Constructor
    public function __construct($db) {
        $this->db = $db;
        $this->message = new Message($db);
    }
    
    // Get conversation between two users
    public function getConversation($user1_id, $user2_id) {
        // Get conversation
        $stmt = $this->message->getConversation($user1_id, $user2_id);
        $num = $stmt->rowCount();
        
        // Check if any messages exist
        if($num > 0) {
            // Messages array
            $messages_arr = [];
            
            // Retrieve table contents
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                $message_item = [
                    'id' => $id,
                    'sender_id' => $sender_id,
                    'receiver_id' => $receiver_id,
                    'message' => $message,
                    'is_read' => $is_read,
                    'created_at' => $created_at,
                    'sender' => [
                        'id' => $sender_id,
                        'name' => $sender_name,
                        'photo_url' => $sender_photo,
                        'role' => $sender_role
                    ],
                    'receiver' => [
                        'id' => $receiver_id,
                        'name' => $receiver_name,
                        'photo_url' => $receiver_photo,
                        'role' => $receiver_role
                    ],
                    'attachments' => []
                ];
                
                // Get attachments for this message
                $attachments_stmt = $this->message->getAttachments($id);
                while($attachment_row = $attachments_stmt->fetch(PDO::FETCH_ASSOC)) {
                    $message_item['attachments'][] = [
                        'id' => $attachment_row['id'],
                        'file_name' => $attachment_row['file_name'],
                        'file_path' => $attachment_row['file_path'],
                        'file_type' => $attachment_row['file_type'],
                        'file_size' => $attachment_row['file_size'],
                        'created_at' => $attachment_row['created_at']
                    ];
                }
                
                $messages_arr[] = $message_item;
            }
            
            // Mark messages as read
            $this->message->markAsRead($user2_id, $user1_id);
            
            return [
                'status' => 'success',
                'data' => $messages_arr
            ];
        } else {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }
    
    // Get recent conversations for a user
    public function getRecentConversations($user_id) {
        // Get recent conversations
        $stmt = $this->message->getRecentConversations($user_id);
        $num = $stmt->rowCount();
        
        // Check if any conversations exist
        if($num > 0) {
            // Conversations array
            $conversations_arr = [];
            
            // Retrieve table contents
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                
                // Determine the other user in the conversation
                $other_user_id = ($sender_id == $user_id) ? $receiver_id : $sender_id;
                $other_user_name = ($sender_id == $user_id) ? $receiver_name : $sender_name;
                $other_user_photo = ($sender_id == $user_id) ? $receiver_photo : $sender_photo;
                $other_user_role = ($sender_id == $user_id) ? $receiver_role : $sender_role;
                
                $conversation_item = [
                    'id' => $id,
                    'user_id' => $other_user_id,
                    'name' => $other_user_name,
                    'photo_url' => $other_user_photo,
                    'role' => $other_user_role,
                    'last_message' => $message,
                    'last_message_time' => $created_at,
                    'unread_count' => $unread_count,
                    'is_online' => $is_online ?? 0,
                    'last_active' => $last_active ?? null
                ];
                
                $conversations_arr[] = $conversation_item;
            }
            
            return [
                'status' => 'success',
                'data' => $conversations_arr
            ];
        } else {
            return [
                'status' => 'success',
                'data' => []
            ];
        }
    }
    
    // Send a message
    public function sendMessage($data) {
        // Set message properties
        $this->message->sender_id = $data['sender_id'];
        $this->message->receiver_id = $data['receiver_id'];
        $this->message->message = $data['message'];
        $this->message->is_read = 0;
        
        // Create message
        if($this->message->create()) {
            $message_id = $this->message->id;
            $attachments = [];
            
            // Handle attachments if any
            if(isset($data['attachments']) && is_array($data['attachments'])) {
                foreach($data['attachments'] as $attachment) {
                    // Process file upload
                    $file_name = $attachment['name'];
                    $file_type = $attachment['type'];
                    $file_size = $attachment['size'];
                    $file_tmp = $attachment['tmp_name'];
                    
                    // Generate unique file name
                    $unique_name = uniqid() . '_' . $file_name;
                    $upload_dir = '../../uploads/attachments/';
                    
                    // Create directory if it doesn't exist
                    if(!is_dir($upload_dir)) {
                        mkdir($upload_dir, 0777, true);
                    }
                    
                    $file_path = $upload_dir . $unique_name;
                    
                    // Move uploaded file
                    if(move_uploaded_file($file_tmp, $file_path)) {
                        // Add attachment to database
                        if($this->message->addAttachment(
                            $message_id,
                            $file_name,
                            'uploads/attachments/' . $unique_name,
                            $file_type,
                            $file_size
                        )) {
                            $attachments[] = [
                                'file_name' => $file_name,
                                'file_path' => 'uploads/attachments/' . $unique_name,
                                'file_type' => $file_type,
                                'file_size' => $file_size
                            ];
                        }
                    }
                }
            }
            
            // Get the created message with sender and receiver details
            $stmt = $this->message->getConversation($data['sender_id'], $data['receiver_id']);
            $messages = [];
            
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                if($row['id'] == $message_id) {
                    $message_data = [
                        'id' => $row['id'],
                        'sender_id' => $row['sender_id'],
                        'receiver_id' => $row['receiver_id'],
                        'message' => $row['message'],
                        'is_read' => $row['is_read'],
                        'created_at' => $row['created_at'],
                        'sender' => [
                            'id' => $row['sender_id'],
                            'name' => $row['sender_name'],
                            'photo_url' => $row['sender_photo'],
                            'role' => $row['sender_role']
                        ],
                        'receiver' => [
                            'id' => $row['receiver_id'],
                            'name' => $row['receiver_name'],
                            'photo_url' => $row['receiver_photo'],
                            'role' => $row['receiver_role']
                        ],
                        'attachments' => $attachments
                    ];
                    $messages = $message_data;
                    break;
                }
            }
            
            return [
                'status' => 'success',
                'message' => 'Message sent successfully',
                'data' => $messages
            ];
        } else {
            return [
                'status' => 'error',
                'message' => 'Failed to send message'
            ];
        }
    }
    
    // Mark messages as read
    public function markMessagesAsRead($sender_id, $receiver_id) {
        if($this->message->markAsRead($sender_id, $receiver_id)) {
            return [
                'status' => 'success',
                'message' => 'Messages marked as read'
            ];
        } else {
            return [
                'status' => 'error',
                'message' => 'Failed to mark messages as read'
            ];
        }
    }
    
    // Get unread message count
    public function getUnreadCount($user_id) {
        $unread_count = $this->message->getUnreadCount($user_id);
        
        return [
            'status' => 'success',
            'data' => [
                'unread_count' => $unread_count
            ]
        ];
    }
    
    // Update user online status
    public function updateUserStatus($user_id, $is_online) {
        if($this->message->updateUserStatus($user_id, $is_online)) {
            return [
                'status' => 'success',
                'message' => 'User status updated'
            ];
        } else {
            return [
                'status' => 'error',
                'message' => 'Failed to update user status'
            ];
        }
    }
    
    // Get user online status
    public function getUserStatus($user_id) {
        $status = $this->message->getUserStatus($user_id);
        
        return [
            'status' => 'success',
            'data' => $status
        ];
    }
}
?> 