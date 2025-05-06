-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create roles table in auth schema
CREATE TABLE IF NOT EXISTS auth.roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create policies table in auth schema
CREATE TABLE IF NOT EXISTS auth.policies (
    id SERIAL PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL UNIQUE,
    base_url VARCHAR(255),
    version VARCHAR(20),
    enabled BOOLEAN DEFAULT TRUE,
    mock BOOLEAN DEFAULT FALSE,
    feature VARCHAR(100) NOT NULL,
    functions JSONB NOT NULL, -- Stores all available endpoints and their configurations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role_policy_binding table in auth schema
CREATE TABLE IF NOT EXISTS auth.role_policy_binding (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES auth.roles(id) ON DELETE CASCADE,
    policy_id INTEGER REFERENCES auth.policies(id) ON DELETE CASCADE,
    allowed_functions TEXT[], -- Array of function names that are allowed for this role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, policy_id)
);

-- Insert default roles
INSERT INTO auth.roles (role_name, description) VALUES 
('admin', 'Administrator with full access to all features'),
('user', 'Regular user with limited access');

-- Insert sample policies based on the API endpoints
INSERT INTO auth.policies (policy_name, base_url, version, enabled, mock, feature, functions) VALUES
('feedback_policy', 'https://api.example.com', 'v1.0', TRUE, FALSE, 'feedback', 
    '{
        "feedbacktypes": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all the feedback types"
        },
        "feedbacktypes/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a specific feedback type by ID"
        },
        "feedback": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create new feedback"
        },
        "feedback": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all feedback entries"
        },
        "feedback/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get feedback by ID"
        },
        "feedback/:id": {
            "enabled": true,
            "method": "put",
            "description": "Endpoint to update feedback"
        },
        "feedback/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete feedback"
        },
        "feedback/reference/:referenceNumber": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get feedback by reference number"
        },
        "feedback/:id/responses": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all responses for a specific feedback"
        },
        "feedback/responses": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a new feedback response"
        },
        "feedback/user/requests": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all feedback requests for the authenticated user"
        }
    }'
),
('notification_policy', 'https://api.example.com', 'v1.0', TRUE, FALSE, 'notification', 
    '{
        "templates": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a new template"
        },
        "templates": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all templates or find by identifier"
        },
        "templates/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a template by ID"
        },
        "templates/:id": {
            "enabled": true,
            "method": "put",
            "description": "Endpoint to update a template"
        },
        "templates/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a template"
        },
        "templates/:id/preview": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to preview a template"
        },
        "notifications/email/send": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to send email notification"
        }
    }'
),
('products_policy', 'https://api.example.com', 'v1.0', TRUE, FALSE, 'products', 
    '{
        "products": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a new product"
        },
        "products": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all products"
        },
        "products/valid": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get valid products for a specific date"
        },
        "products/:id": {
            "enabled": true,
            "method": "put",
            "description": "Endpoint to update a product"
        },
        "products/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a product"
        }
    }'
),
('subscription_policy', 'https://api.example.com', 'v1.0', TRUE, FALSE, 'subscription', 
    '{
        "subscription-status": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all subscription statuses"
        },
        "subscription-status": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a subscription status"
        },
        "subscription-status/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a subscription status by ID"
        },
        "subscription-status/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Endpoint to update a subscription status by ID"
        },
        "subscription-status/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a subscription status by ID"
        },
        "subscriptions": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all subscriptions"
        },
        "subscriptions": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a subscription"
        },
        "subscriptions/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a subscription by ID"
        },
        "subscriptions/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Endpoint to update a subscription by ID"
        },
        "subscriptions/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a subscription by ID"
        },
        "discount-type": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all discount types"
        },
        "discount-type": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a discount type"
        },
        "discount-type/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a discount type by ID"
        },
        "discount-type/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Endpoint to update a discount type by ID"
        },
        "discount-type/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a discount type by ID"
        },
        "discounts": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all discounts"
        },
        "discounts": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a discount"
        },
        "discounts/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a discount by ID"
        },
        "discounts/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Endpoint to update a discount by ID"
        },
        "discounts/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a discount by ID"
        },
        "subscription-discounts": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get all subscription discounts"
        },
        "subscription-discounts": {
            "enabled": true,
            "method": "post",
            "description": "Endpoint to create a subscription discount"
        },
        "subscription-discounts/:id": {
            "enabled": true,
            "method": "get",
            "description": "Endpoint to get a subscription discount by ID"
        },
        "subscription-discounts/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Endpoint to update a subscription discount by ID"
        },
        "subscription-discounts/:id": {
            "enabled": true,
            "method": "delete",
            "description": "Endpoint to delete a subscription discount by ID"
        }
    }'
);

-- Insert role-policy bindings for admin (full access)
INSERT INTO auth.role_policy_binding (role_id, policy_id, allowed_functions) VALUES
(1, 1, ARRAY[
    'get<>feedbacktypes', 
    'get<>feedbacktypes/:id', 
    'post<>feedback', 
    'get<>feedback', 
    'get<>feedback/:id', 
    'put<>feedback/:id', 
    'delete<>feedback/:id', 
    'get<>feedback/user/requests',
    'get<>feedback/:id/responses',
    'post<>feedback/responses',
    'get<>feedback/reference/:referenceNumber'
]),
(1, 2, ARRAY[
    'post<>templates',
    'get<>templates',
    'get<>templates/:id',
    'put<>templates/:id',
    'delete<>templates/:id',
    'get<>templates/:id/preview',
    'post<>notifications/email/send'
]),
(1, 3, ARRAY[
    'post<>products', 
    'get<>products', 
    'get<>products/valid', 
    'put<>products/:id',
    'delete<>products/:id'
]),
(1, 4, ARRAY[
    'get<>subscription-status', 
    'post<>subscription-status',
    'get<>subscription-status/:id', 
    'patch<>subscription-status/:id',
    'delete<>subscription-status/:id',
    'get<>subscriptions', 
    'post<>subscriptions',
    'get<>subscriptions/:id',
    'patch<>subscriptions/:id',
    'delete<>subscriptions/:id',
    'get<>discount-type',
    'post<>discount-type',
    'get<>discount-type/:id',
    'patch<>discount-type/:id',
    'delete<>discount-type/:id',
    'get<>discounts',
    'post<>discounts',
    'get<>discounts/:id',
    'patch<>discounts/:id',
    'delete<>discounts/:id',
    'get<>subscription-discounts',
    'post<>subscription-discounts',
    'get<>subscription-discounts/:id',
    'patch<>subscription-discounts/:id',
    'delete<>subscription-discounts/:id'
]);

-- Insert role-policy bindings for regular user (limited access - can get and update but not delete)
INSERT INTO auth.role_policy_binding (role_id, policy_id, allowed_functions) VALUES
(2, 1, ARRAY[
    'get<>feedbacktypes', 
    'get<>feedbacktypes/:id', 
    'post<>feedback', 
    'get<>feedback', 
    'get<>feedback/:id', 
    'put<>feedback/:id', 
    'get<>feedback/user/requests',
    'get<>feedback/:id/responses',
    'post<>feedback/responses',
    'get<>feedback/reference/:referenceNumber'
]),
(2, 3, ARRAY[
    'get<>products', 
    'get<>products/valid'
]),
(2, 4, ARRAY[
    'get<>subscription-status',
    'get<>subscriptions',
    'get<>subscription-status/:id', 
    'get<>subscriptions/:id'
]);

-- Add PGY policy
INSERT INTO auth.policies (policy_name, base_url, version, enabled, mock, feature, functions) VALUES
('pgy_policy', 'https://api.example.com', 'v1.0', TRUE, FALSE, 'pgy', 
    '{
        "customers": {
            "enabled": true,
            "method": "post",
            "description": "Create a new customer"
        },
        "customers": {
            "enabled": true,
            "method": "get",
            "description": "Get all customers"
        },
        "customers/:id": {
            "enabled": true,
            "method": "get",
            "description": "Get customer by ID"
        },
        "customers/:id": {
            "enabled": true,
            "method": "patch",
            "description": "Update customer details"
        },
        "orders": {
            "enabled": true,
            "method": "post",
            "description": "Create a new order"
        },
        "orders/:id": {
            "enabled": true,
            "method": "get",
            "description": "Get order by ID"
        },
        "payments/verify/order": {
            "enabled": true,
            "method": "post",
            "description": "Verify payment signature"
        },
        "payments/verify/subscription": {
            "enabled": true,
            "method": "post",
            "description": "Verify subscription payment signature"
        },
        "payments/:id": {
            "enabled": true,
            "method": "get",
            "description": "Get payment by ID"
        },
        "subscriptions": {
            "enabled": true,
            "method": "post",
            "description": "Create a new subscription"
        },
        "subscriptions/:id": {
            "enabled": true,
            "method": "get",
            "description": "Get subscription by ID"
        },
        "plans": {
            "enabled": true,
            "method": "post",
            "description": "Create a new plan"
        },
        "plans": {
            "enabled": true,
            "method": "get",
            "description": "Get all plans"
        },
        "plans/:id": {
            "enabled": true,
            "method": "get",
            "description": "Get plan by ID"
        }
    }'
);

-- Add PGY policy bindings for admin (full access)
INSERT INTO auth.role_policy_binding (role_id, policy_id, allowed_functions) VALUES
(1, (SELECT id FROM auth.policies WHERE policy_name = 'pgy_policy'), ARRAY[
    'post<>customers',
    'get<>customers',
    'get<>customers/:id',
    'patch<>customers/:id',
    'post<>orders',
    'get<>orders/:id',
    'post<>payments/verify/order',
    'post<>payments/verify/subscription',
    'get<>payments/:id',
    'post<>subscriptions',
    'get<>subscriptions/:id',
    'post<>plans',
    'get<>plans',
    'get<>plans/:id'
]);

-- Add PGY policy bindings for regular user (limited access - can only view and verify payments)
INSERT INTO auth.role_policy_binding (role_id, policy_id, allowed_functions) VALUES
(2, (SELECT id FROM auth.policies WHERE policy_name = 'pgy_policy'), ARRAY[
    'get<>customers/:id',
    'get<>orders/:id',
    'post<>payments/verify/order',
    'post<>payments/verify/subscription',
    'get<>payments/:id',
    'get<>subscriptions/:id',
    'get<>plans',
    'get<>plans/:id'
]);

-- Create function to check if a user has permission to access a specific endpoint
CREATE OR REPLACE FUNCTION auth.check_permission(
    p_role_name VARCHAR,
    p_feature VARCHAR,
    p_function_name VARCHAR,
    p_method VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    v_allowed BOOLEAN := FALSE;
    v_function_config JSONB;
    v_policy_id INTEGER;
    v_method_function VARCHAR;
BEGIN
    -- Find the policy ID for the feature
    SELECT id INTO v_policy_id FROM auth.policies 
    WHERE feature = p_feature AND enabled = TRUE;
    
    IF v_policy_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if the function exists in the policy
    SELECT functions->p_function_name INTO v_function_config 
    FROM auth.policies 
    WHERE id = v_policy_id;
    
    IF v_function_config IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Construct the method<>function format
    v_method_function := LOWER(p_method) || '<>' || p_function_name;
    
    -- Check if the role has permission to access this function with this method
    SELECT EXISTS (
        SELECT 1 
        FROM auth.role_policy_binding rpb
        JOIN auth.roles r ON rpb.role_id = r.id
        WHERE r.role_name = p_role_name
        AND rpb.policy_id = v_policy_id
        AND v_method_function = ANY(rpb.allowed_functions)
    ) INTO v_allowed;
    
    RETURN v_allowed;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT auth.check_permission('user', 'feedback', 'feedbacktypes', 'get');  -- Should return TRUE
-- SELECT auth.check_permission('user', 'feedback', 'feedback/:id', 'delete');  -- Should return FALSE