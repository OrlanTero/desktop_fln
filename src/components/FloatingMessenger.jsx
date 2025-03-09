import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
  InputAdornment,
  Badge,
  Chip,
  Tooltip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Search as SearchIcon,
  KeyboardArrowLeft as LeftArrowIcon,
  KeyboardArrowRight as RightArrowIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

// Emoji list
const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'];

const FloatingMessenger = ({ currentUser }) => {
  console.log('FloatingMessenger rendered with currentUser:', currentUser);
  
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollInterval = useRef(null);
  
  // Fetch users and start polling for updates
  useEffect(() => {
    if (open && currentUser) {
      console.log('Component opened with currentUser:', currentUser);
      // Test API connection
      window.api.testConnection().then(response => {
        console.log('API Connection test:', response);
      }).catch(error => {
        console.error('API Connection test failed:', error);
      });
      
      fetchUsers();
      fetchConversations();
      fetchUnreadCount();
      
      // Start polling for new messages and updates
      pollInterval.current = setInterval(() => {
        if (selectedChat) {
          fetchMessages(selectedChat.user_id);
        }
        fetchConversations();
        fetchUnreadCount();
      }, 5000); // Poll every 5 seconds
      
      // Update user status to online
      window.api.message.updateUserStatus(currentUser.id, 1);
    }
    
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      if (currentUser) {
        window.api.message.updateUserStatus(currentUser.id, 0);
      }
    };
  }, [open, currentUser, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

    const fetchUsers = async () => {
      setLoading(true);
      try {
      console.log('Fetching users...');
        const response = await window.api.user.getAll();
      console.log('API Response:', response);
        if (response.success) {
        const filteredUsers = response.data.filter(user => user.id !== currentUser.id) || [];
        console.log('Filtered users:', filteredUsers);
        console.log('Current user:', currentUser);
        setUsers(filteredUsers);
        } else {
          console.error('Failed to fetch users:', response.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

  const fetchConversations = async () => {
    if (!currentUser) return;
    
    try {
      const response = await window.api.message.getRecentConversations(currentUser.id);
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    if (!currentUser) return;
    
    try {
      const response = await window.api.message.getConversation(currentUser.id, otherUserId);
      if (response.success) {
        setMessages(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser) return;
    
    try {
      const response = await window.api.message.getUnreadCount(currentUser.id);
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleToggle = () => {
    console.log('Toggle clicked, current open state:', open);
    console.log('Current user when toggling:', currentUser);
    setOpen(!open);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    await fetchMessages(chat.user_id);
    // Mark messages as read
    await window.api.message.markAsRead(chat.user_id, currentUser.id);
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setMessages([]);
    setMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !selectedChat || !currentUser) return;
    
    setSendingMessage(true);
    try {
      let response;
      
      if (attachments.length > 0) {
        // Send message with attachments
        const formData = new FormData();
        formData.append('sender_id', currentUser.id);
        formData.append('receiver_id', selectedChat.user_id);
        formData.append('message', message);
        
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
        
        response = await window.api.message.sendMessageWithAttachments(formData);
      } else {
        // Send text-only message
        response = await window.api.message.sendMessage({
          sender_id: currentUser.id,
          receiver_id: selectedChat.user_id,
          message: message.trim()
        });
      }
      
      if (response.success) {
    setMessage('');
        setAttachments([]);
        await fetchMessages(selectedChat.user_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
    event.target.value = null; // Reset input
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll the user avatars horizontally
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'employee':
        return 'primary';
      case 'liaison':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Fab
        color="primary"
        aria-label="messenger"
        onClick={handleToggle}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <ChatIcon />
        </Badge>
      </Fab>

      {/* Sliding Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 350 },
            height: '100%',
            boxSizing: 'border-box',
          },
        }}
        variant="temporary"
        ModalProps={{
          keepMounted: true,
        }}
      >
        {selectedChat ? (
          // Chat view
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <IconButton onClick={handleBackToChats} edge="start">
                <CloseIcon />
              </IconButton>
              <Avatar sx={{ mx: 1 }}>
                {selectedChat.photo_url ? (
                  <img src={selectedChat.photo_url} alt={selectedChat.name} />
                ) : (
                  selectedChat.name.charAt(0)
                )}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedChat.name}
                </Typography>
                <Chip 
                  label={selectedChat.role} 
                  size="small" 
                  color={getRoleColor(selectedChat.role)}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    mb: 2,
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: msg.sender_id === currentUser.id ? 'primary.light' : 'grey.100',
                      color: msg.sender_id === currentUser.id ? 'white' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {msg.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              mt: 0.5, 
                              color: msg.sender_id === currentUser.id ? 'white' : 'primary',
                              borderColor: msg.sender_id === currentUser.id ? 'white' : 'primary.main',
                            }}
                            onClick={() => window.api.utils.loadAttachment(attachment.file_path, attachment.file_name)}
                          >
                            <AttachFileIcon sx={{ mr: 0.5 }} />
                            {attachment.file_name}
                          </Button>
                        ))}
                      </Box>
                    )}
                    
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                      {formatMessageTime(msg.created_at)}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveAttachment(index)}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: '80px',
                  right: '16px',
                  maxWidth: '320px',
                  p: 1,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: 0.5,
                }}
              >
                {emojis.map((emoji, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Paper>
            )}

            {/* Message input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={message}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={4}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <EmojiIcon color={showEmojiPicker ? 'primary' : 'inherit'} />
                      </IconButton>
                      <IconButton onClick={handleAttachmentClick}>
                        <AttachFileIcon />
                      </IconButton>
                      <IconButton 
                        color="primary" 
                        onClick={handleSendMessage} 
                        disabled={sendingMessage || (!message.trim() && attachments.length === 0)}
                      >
                        {sendingMessage ? <CircularProgress size={24} /> : <SendIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
              />
            </Box>
          </Box>
        ) : (
          // Chats list view
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Messenger
                </Typography>
                <IconButton onClick={handleToggle} edge="end">
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Horizontally scrollable user avatars */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton 
                  size="small" 
                  onClick={handleScrollLeft}
                  sx={{ mr: 1 }}
                >
                  <LeftArrowIcon />
                </IconButton>
                
                <Box 
                  ref={scrollRef}
                  sx={{ 
                    display: 'flex', 
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    whiteSpace: 'nowrap',
                    py: 1,
                    flex: 1
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 1 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : users.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 1 }}>
                      <Typography variant="body2">No users found</Typography>
                    </Box>
                  ) : (
                    users.map((user) => (
                      <Box 
                        key={user.id} 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          mx: 1,
                          minWidth: 60,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleChatSelect({
                          user_id: user.id,
                          name: user.name,
                          photo_url: user.photo_url,
                          role: user.role
                        })}
                      >
                        <Tooltip title={`${user.name} (${user.role})`}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            variant="dot"
                            color={user.online ? 'success' : 'error'}
                          >
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40,
                                border: user.online ? '2px solid #4caf50' : '2px solid transparent'
                              }}
                            >
                              {user.photo_url ? (
                                <img src={user.photo_url} alt={user.name} />
                              ) : (
                                user.name.charAt(0)
                              )}
                            </Avatar>
                          </Badge>
                        </Tooltip>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            mt: 0.5, 
                            textAlign: 'center',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.name.split(' ')[0]}
                        </Typography>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={getRoleColor(user.role)}
                          sx={{ height: 16, fontSize: '0.6rem', mt: 0.5 }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
                
                <IconButton 
                  size="small" 
                  onClick={handleScrollRight}
                  sx={{ ml: 1 }}
                >
                  <RightArrowIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Search */}
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Box>

            {/* Conversations list */}
            <List sx={{ flexGrow: 1, overflow: 'auto' }}>
              {filteredConversations.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No conversations found
                  </Typography>
                </Box>
              ) : (
                filteredConversations.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem 
                      button 
                      onClick={() => handleChatSelect(chat)}
                      sx={{ 
                        bgcolor: chat.unread_count > 0 ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                      }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={chat.unread_count} color="error">
                          <Avatar>
                            {chat.photo_url ? (
                              <img src={chat.photo_url} alt={chat.name} />
                            ) : (
                              chat.name.charAt(0)
                            )}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: chat.unread_count > 0 ? 'bold' : 'normal',
                                mr: 1
                              }}
                            >
                              {chat.name}
                            </Typography>
                            <Chip 
                              label={chat.role} 
                              size="small" 
                              color={getRoleColor(chat.role)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={chat.last_message}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontWeight: chat.unread_count > 0 ? 'bold' : 'normal',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatMessageTime(chat.last_message_time)}
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default FloatingMessenger; 