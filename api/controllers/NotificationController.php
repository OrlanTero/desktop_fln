<?php
require_once 'models/Notification.php';

class NotificationController
{
    private $db;
    private $notification;

    public function __construct($db)
    {
        $this->db = $db;
        $this->notification = new Notification($db);
    }

    // Get all notifications for a user
    public function getAllForUser($userId, $params = [])
    {
        // Set default parameters
        $limit = isset($params['limit']) ? (int) $params['limit'] : 50;
        $offset = isset($params['offset']) ? (int) $params['offset'] : 0;
        $onlyUnread = isset($params['unread']) && $params['unread'] === 'true';

        // Get notifications
        $stmt = $this->notification->getAllForUser($userId, $limit, $offset, $onlyUnread);
        $num = $stmt->rowCount();

        // Get unread count
        $unreadCount = $this->notification->getUnreadCount($userId);

        if ($num > 0) {
            $notifications_arr = [];
            $notifications_arr["status"] = "success";
            $notifications_arr["total_unread"] = $unreadCount;
            $notifications_arr["count"] = $num;
            $notifications_arr["data"] = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);

                $notification_item = [
                    "id" => $id,
                    "user_id" => $user_id,
                    "sender_id" => $sender_id,
                    "sender" => [
                        "id" => $sender_id,
                        "name" => $sender_name ?? null,
                        "photo_url" => $sender_photo_url ?? null,
                        "role" => $sender_role ?? null
                    ],
                    "title" => $title,
                    "message" => $message,
                    "type" => $type,
                    "reference_type" => $reference_type,
                    "reference_id" => $reference_id,
                    "is_read" => (bool) $is_read,
                    "severity" => $severity,
                    "icon" => $icon,
                    "source_device" => $source_device,
                    "created_at" => $created_at,
                    "updated_at" => $updated_at
                ];

                array_push($notifications_arr["data"], $notification_item);
            }

            return $notifications_arr;
        } else {
            return [
                "status" => "success",
                "total_unread" => $unreadCount,
                "count" => 0,
                "data" => []
            ];
        }
    }

    // Get notification by ID
    public function getById($id)
    {
        $this->notification->id = $id;

        if ($this->notification->getById()) {
            return [
                "status" => "success",
                "data" => [
                    "id" => $this->notification->id,
                    "user_id" => $this->notification->user_id,
                    "sender_id" => $this->notification->sender_id,
                    "title" => $this->notification->title,
                    "message" => $this->notification->message,
                    "type" => $this->notification->type,
                    "reference_type" => $this->notification->reference_type,
                    "reference_id" => $this->notification->reference_id,
                    "is_read" => (bool) $this->notification->is_read,
                    "severity" => $this->notification->severity,
                    "icon" => $this->notification->icon,
                    "source_device" => $this->notification->source_device,
                    "created_at" => $this->notification->created_at,
                    "updated_at" => $this->notification->updated_at
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Notification not found"
            ];
        }
    }

    // Create notification
    public function create($data)
    {
        // Validate required fields
        if (
            empty($data['user_id']) ||
            empty($data['title']) ||
            empty($data['message'])
        ) {
            return [
                "status" => "error",
                "message" => "Missing required fields: user_id, title, message"
            ];
        }

        // Set notification properties
        $this->notification->user_id = $data['user_id'];
        $this->notification->sender_id = $data['sender_id'] ?? null;
        $this->notification->title = $data['title'];
        $this->notification->message = $data['message'];
        $this->notification->type = $data['type'] ?? 'general';
        $this->notification->reference_type = $data['reference_type'] ?? null;
        $this->notification->reference_id = $data['reference_id'] ?? null;
        $this->notification->is_read = $data['is_read'] ?? 0;
        $this->notification->severity = $data['severity'] ?? 'info';
        $this->notification->icon = $data['icon'] ?? null;
        $this->notification->source_device = $data['source_device'] ?? null;

        if ($this->notification->create()) {
            return [
                "status" => "success",
                "message" => "Notification created",
                "data" => [
                    "id" => $this->notification->id
                ]
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to create notification"
            ];
        }
    }

    // Mark notification as read
    public function markAsRead($id)
    {
        $this->notification->id = $id;

        if ($this->notification->markAsRead()) {
            return [
                "status" => "success",
                "message" => "Notification marked as read"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to mark notification as read"
            ];
        }
    }

    // Mark all notifications as read for a user
    public function markAllAsRead($userId)
    {
        if ($this->notification->markAllAsRead($userId)) {
            return [
                "status" => "success",
                "message" => "All notifications marked as read"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to mark notifications as read"
            ];
        }
    }

    // Delete notification
    public function delete($id)
    {
        $this->notification->id = $id;

        if ($this->notification->delete()) {
            return [
                "status" => "success",
                "message" => "Notification deleted"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete notification"
            ];
        }
    }

    // Delete all notifications for a user
    public function deleteAllForUser($userId)
    {
        if ($this->notification->deleteAllForUser($userId)) {
            return [
                "status" => "success",
                "message" => "All notifications deleted"
            ];
        } else {
            return [
                "status" => "error",
                "message" => "Failed to delete notifications"
            ];
        }
    }

    // Get unread count for a user
    public function getUnreadCount($userId)
    {
        $count = $this->notification->getUnreadCount($userId);

        return [
            "status" => "success",
            "data" => [
                "count" => $count
            ]
        ];
    }
}