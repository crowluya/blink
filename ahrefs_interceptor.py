#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re

from datetime import datetime
from urllib.parse import urlparse

from mitmproxy import http, ctx


def extract_domain(url):
    """从 URL 中提取域名"""
    # 确保 URL 有协议前缀
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    
    # 如果 netloc 为空，可能是因为 URL 格式不标准
    if not domain and parsed_url.path:
        # 取第一个路径段作为域名
        domain = parsed_url.path.split('/')[0]
    
    # 移除端口号
    domain = re.sub(r':\d+$', '', domain)
    
    # 移除 www 前缀
    domain = re.sub(r'^www\.', '', domain)
    
    return domain


def extract_path(url):
    """从 URL 中提取路径，并以短横线连接"""
    # 确保 URL 有协议前缀
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    parsed_url = urlparse(url)
    path = parsed_url.path.strip('/')
    
    # 如果路径为空，返回空字符串
    if not path:
        return ""
    
    # 将路径各部分用短横线连接
    path_parts = [part.strip() for part in path.split('/') if part.strip()]
    return "-".join(path_parts)


class AhrefsInterceptor:
    """拦截 Ahrefs API 请求并保存响应数据"""

    def __init__(self, cache_dir):
        # 设置基础目录
        self.cache_dir = cache_dir
        
        # 创建缓存目录（如果不存在）
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # 需要拦截的 API 端点
        self.target_endpoints = [
            "stGetFreeBacklinksOverview",
            "stGetFreeBacklinksList"
        ]
        
        # 记录初始化信息
        ctx.log.info(f"AhrefsInterceptor已初始化，缓存目录：{self.cache_dir}")
    
    def get_cache_dir(self):
        """获取当前日期的缓存目录路径，并确保目录存在"""
        today = datetime.now().strftime("%Y-%m-%d")
        cache_dir = os.path.join(self.cache_dir, today)
        os.makedirs(cache_dir, exist_ok=True)
        return cache_dir

    def response(self, flow: http.HTTPFlow) -> None:
        """处理 HTTP 响应"""
        # 检查是否是目标 API 请求
        if not flow.request.url.startswith("https://ahrefs.com/v4/"):
            return
        
        endpoint = flow.request.path.split('/')[-1]
        if endpoint not in self.target_endpoints:
            return
        
        # 获取当前日期的缓存目录
        cache_dir = self.get_cache_dir()
        
        # 尝试解析响应 JSON
        try:
            response_data = json.loads(flow.response.content)
            
            # 从请求内容中获取信息
            request_content = json.loads(flow.request.content)
            
            if endpoint == "stGetFreeBacklinksOverview":
                # 直接从请求内容中提取 URL 和 mode
                url = request_content.get("url", "")
                mode = request_content.get("mode", "subdomains")
                
                # 提取域名和路径
                domain = extract_domain(url)
                path = extract_path(url)
                
                if path:
                    filename = f"{domain}-{mode}-{path}-stGetFreeBacklinksOverview.json"
                else:
                    filename = f"{domain}-{mode}-stGetFreeBacklinksOverview.json"
            
            elif endpoint == "stGetFreeBacklinksList":
                # 从请求内容中提取 URL 和 mode
                signed_input = request_content.get("signedInput", {}).get("input", {})
                url = signed_input.get("url", "")
                mode = signed_input.get("mode", "subdomains")
                
                # 提取域名和路径
                domain = extract_domain(url)
                path = extract_path(url)
                
                if path:
                    filename = f"{domain}-{mode}-{path}-stGetFreeBacklinksList.json"
                else:
                    filename = f"{domain}-{mode}-stGetFreeBacklinksList.json"
            
            # 保存 JSON 数据到文件
            filepath = os.path.join(cache_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(response_data, f, ensure_ascii=False, indent=2)
            
            ctx.log.info(f"已保存数据到: {filepath}")
        
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            ctx.log.error(f"处理 {endpoint} 响应时出错: {str(e)}")


script_dir = os.path.dirname(os.path.abspath(__file__))
cache_path = os.path.join(script_dir, "cache-data/backlinks")

addons = [
    AhrefsInterceptor(cache_dir=cache_path)
] 