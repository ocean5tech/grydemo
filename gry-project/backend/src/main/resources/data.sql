-- Initial test data
INSERT INTO users (username, email, password, created_at, updated_at) VALUES 
('testuser1', 'test1@example.com', 'password123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('testuser2', 'test2@example.com', 'password456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin', 'admin@example.com', 'admin123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO products (name, description, price, stock_quantity, created_at, updated_at) VALUES 
('笔记本电脑', '高性能办公笔记本电脑，16GB内存，512GB SSD', 5999.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('无线鼠标', '蓝牙无线鼠标，人体工学设计', 199.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('机械键盘', '87键机械键盘，青轴', 299.00, 75, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('显示器', '27寸4K显示器', 1999.00, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('耳机', '降噪无线耳机', 899.00, 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO orders (user_id, total_amount, status, created_at, updated_at) VALUES 
(1, 6198.00, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1098.00, 'PROCESSING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 299.00, 'DELIVERED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES 
(1, 1, 1, 5999.00),
(1, 2, 1, 199.00),
(2, 4, 1, 1999.00),
(2, 5, 1, 899.00),
(3, 3, 1, 299.00);