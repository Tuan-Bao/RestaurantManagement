"""
MoMo Payment Integration for Restaurant Management System
Documentation: https://developers.momo.vn/v3/docs/payment/api/payment-api/
"""

import hashlib
import hmac
import json
import uuid
import requests
from django.conf import settings


class MoMoPayment:
    """
    MoMo Payment Gateway Integration
    Sử dụng môi trường TEST của MoMo
    """
    
    # MoMo Test Environment
    ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create"
    
    def __init__(self):
        self.partner_code = settings.MOMO_PARTNER_CODE
        self.access_key = settings.MOMO_ACCESS_KEY
        self.secret_key = settings.MOMO_SECRET_KEY
        self.redirect_url = settings.MOMO_REDIRECT_URL
        self.ipn_url = settings.MOMO_IPN_URL
    
    def create_payment(self, order_id, amount, order_info="Thanh toán đơn hàng"):
        """
        Tạo payment request đến MoMo
        
        Args:
            order_id (int): ID của order
            amount (int): Số tiền cần thanh toán (VND)
            order_info (str): Mô tả đơn hàng
            
        Returns:
            dict: Response từ MoMo API
        """
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        order_id_str = f"ORDER_{order_id}_{request_id[:8]}"
        
        # Prepare request data
        raw_data = {
            "partnerCode": self.partner_code,
            "partnerName": "Restaurant Management",
            "storeId": "RestaurantStore01",
            "requestId": request_id,
            "amount": int(amount),
            "orderId": order_id_str,
            "orderInfo": order_info,
            "redirectUrl": self.redirect_url,  # User thấy trang frontend
            "ipnUrl": self.ipn_url,            # Backend nhận callback
            "lang": "vi",
            "requestType": "captureWallet",
            "autoCapture": True,
            "extraData": ""
        }
        
        # Generate signature
        raw_signature = (
            f"accessKey={self.access_key}"
            f"&amount={raw_data['amount']}"
            f"&extraData={raw_data['extraData']}"
            f"&ipnUrl={raw_data['ipnUrl']}"
            f"&orderId={raw_data['orderId']}"
            f"&orderInfo={raw_data['orderInfo']}"
            f"&partnerCode={raw_data['partnerCode']}"
            f"&redirectUrl={raw_data['redirectUrl']}"
            f"&requestId={raw_data['requestId']}"
            f"&requestType={raw_data['requestType']}"
        )
        
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        raw_data['signature'] = signature
        
        # Send request to MoMo
        try:
            response = requests.post(
                self.ENDPOINT,
                json=raw_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            result = response.json()
            
            # Add request_id to result for tracking
            result['requestId'] = request_id
            result['orderId'] = order_id_str
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                'resultCode': 99,
                'message': f'Connection error: {str(e)}',
                'requestId': request_id
            }
        except json.JSONDecodeError:
            return {
                'resultCode': 98,
                'message': 'Invalid JSON response from MoMo',
                'requestId': request_id
            }
    
    def verify_signature(self, data):
        """
        Xác thực signature từ MoMo IPN callback
        
        Args:
            data (dict): Dữ liệu từ MoMo callback
            
        Returns:
            bool: True nếu signature hợp lệ
        """
        # Extract signature from data
        received_signature = data.get('signature', '')
        
        # Build raw signature string
        raw_signature = (
            f"accessKey={self.access_key}"
            f"&amount={data.get('amount', '')}"
            f"&extraData={data.get('extraData', '')}"
            f"&message={data.get('message', '')}"
            f"&orderId={data.get('orderId', '')}"
            f"&orderInfo={data.get('orderInfo', '')}"
            f"&orderType={data.get('orderType', '')}"
            f"&partnerCode={data.get('partnerCode', '')}"
            f"&payType={data.get('payType', '')}"
            f"&requestId={data.get('requestId', '')}"
            f"&responseTime={data.get('responseTime', '')}"
            f"&resultCode={data.get('resultCode', '')}"
            f"&transId={data.get('transId', '')}"
        )
        
        # Calculate signature
        calculated_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_signature == received_signature
    
    def check_transaction_status(self, request_id, order_id):
        """
        Kiểm tra trạng thái giao dịch từ MoMo
        
        Args:
            request_id (str): Request ID ban đầu
            order_id (str): Order ID đã gửi đến MoMo
            
        Returns:
            dict: Thông tin trạng thái giao dịch
        """
        endpoint = "https://test-payment.momo.vn/v2/gateway/api/query"
        
        raw_data = {
            "partnerCode": self.partner_code,
            "requestId": str(uuid.uuid4()),  # New request ID for query
            "orderId": order_id,
            "lang": "vi"
        }
        
        # Generate signature for query
        raw_signature = (
            f"accessKey={self.access_key}"
            f"&orderId={raw_data['orderId']}"
            f"&partnerCode={raw_data['partnerCode']}"
            f"&requestId={raw_data['requestId']}"
        )
        
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        raw_data['signature'] = signature
        
        try:
            response = requests.post(
                endpoint,
                json=raw_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            return response.json()
        except Exception as e:
            return {
                'resultCode': 99,
                'message': f'Query error: {str(e)}'
            }
