INSERT INTO permissions(code) VALUES
('data_management.view'),('data_management.create'),('data_management.update'),('data_management.delete')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions(role_id,permission_id)
SELECT r.id,p.id FROM roles r CROSS JOIN permissions p
WHERE r.name='Administrador' AND p.code LIKE 'data_management.%'
ON CONFLICT DO NOTHING;
