# **如何快速收集高质量外链？**

大家好，我是安于不安，分享下我平时是怎么收集外链的。

核心方法还是飞哥和群友们经常说的抄同行，只不过是在日常找词的同时顺便收集外链。

原来的流程可能是：找词 - 上站 - 找同行 - 收集外链 - 发外链

现在是：找词(+收集外链) - 上站 - 筛选高质量外链 - 发外链

外链查询工具也是经常提到的 ahrefs 的 [**https://ahrefs.com/backlink-checker/**](https://ahrefs.com/backlink-checker/) 。

## **基本思路**

通过 Google 搜索任意关键词，只要看见搜索结果前 3 的网站的域名是近 5 年注册的，那么就把这个域名的外链记录下来；

对于一些竞争非常激烈的词，我会把搜索结果前两页的近 5 年注册的域名的外链都记录下来。

时间长了，你会积累大量不同类型关键词的网站及其外链；其实也不需要多久，一个星期下来，你收集到外链就够你发了。

后续在为自己的网站做外链时，只需要将收集到的外链按照 DR 由高到低稍作筛查，就可以快速找到高质量外链。

整个收集过程，配合 AITDK 和飞哥之前分享的查外链的 Bookmarklet，无非是多点 2-3 下：

- Google 搜素结果前三中看到了近5年注册的域名，打开目标网站;
- Bookmarklet 跳转到 [**https://ahrefs.com/backlink-checker/**](https://ahrefs.com/backlink-checker/) ;
- 可能出现的 Cloudflare 人机验证.

## **为什么是 ahrefs ?**

首先肯定是免费了；其次看下 [**https://ahrefs.com/backlink-checker/**](https://ahrefs.com/backlink-checker/) 接口返回的 JSON 长这样：

```
[
  "TopBacklinks",
  {
    "topBacklinks": {
      "backlinks": [
      ],
      "total": 20
    }
  }
]
```

之前在做的时候看到返回的 JSON 名称是 "TopBacklinks"，想着只是一个变量名而已，实际并不一定是真的 TopBacklinks，我手头也没有外链比较多的网站去验证。

看到今天上午飞哥群里发的那个 ahrefs 的 "Best links: Only":

![image.png](https://s.web.cafe/image/b347e9018d804f7f8526936c3c540d77.png)[**https://ahrefs.com/backlink-checker/?input=mapify.so&mode=subdomains**](https://ahrefs.com/backlink-checker/?input=mapify.so&mode=subdomains)

顺手使用 ahrefs 的外链工具查了下，返回的 20 个外链中，其中就包含了截图中的 6 个；可以相信 "TopBacklinks" 名副其实，确实是该网站的 TopBacklinks。

结合我自己的实验，ahrefs 的这个外链工具返回的对应网站的外链，确实是这个网站的外链中质量比较高的。

下图中这个域名是我这个月14号注册的，实际发了 10 个左右外链，ahrefs 的爬虫目前爬到了 3 个，给我这个新注册的域名 DR 评分是 30。

![image.png](https://s.web.cafe/image/8fe7029169f04a299a63bdc25a475411.png)刚查了下上边 DR 95 的 dofollow 外链是通过一个月访问量 39.5K 的网站获得的，域名是 2021-11 月份注册的，

所以在收集外链过程中不要关心流量大小，只要一个网站在 Google 搜索结果比较靠前的位置，并且域名是近 5 年注册的，这个网站的外链就值得记录下来。

## **借助工具简化收集**

其实就一句话，用 [**mitmproxy**](https://mitmproxy.org/) 拦截 ahrefs 的 API 请求。

### **用到的工具**

- [**mitmproxy**](https://mitmproxy.org/), 拦截请求;
- [**AITDK**](https://aitdk.com/), 方便及时看到域名注册时间;
- [**ZeroOmega**](https://github.com/zero-peak/ZeroOmega)(SwitchyOmega 的 manifest v3 兼容版), 请求分发.

Google 搜索设置默认新标签页打开:

- 访问 google.com;
- 右下角 setting - Search settings;
- Other settings - Results in a new window.

查询当前网站外链的 Bookmarklet:

```
javascript:(function() { var currentDomain = window.location.hostname.replace(/^www\./, ''); var newUrl = 'https://ahrefs.com/backlink-checker/?input=%27 + currentDomain+%27&mode=subdomains%27; window.open(newUrl, %27_blank%27);})();
```

添加到书签栏，如果还不会，看 25.01.20 哥飞-出海上站全流程实操教学 视频的第1小时22分。

### **mitmproxy 拦截 ahrefs 的请求**

mitmproxy 的安装可以看官方文档：

[**https://docs.mitmproxy.org/stable/overview-installation/**](https://docs.mitmproxy.org/stable/overview-installation/)

[**https://docs.mitmproxy.org/stable/concepts-certificates/**](https://docs.mitmproxy.org/stable/concepts-certificates/)

[**https://pypi.org/project/mitmproxy/**](https://pypi.org/project/mitmproxy/)

ahrefs_interceptor.py

```
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
```

启动：

```
mitmdump -s ahrefs_interceptor.py --listen-host 127.0.0.1 -p 38080
```

### **利用 ZeroOmega 分发请求**

请求分发也可以不使用 ZeroOmega，问任意 AI 工具：我使用的是 xx，增加一个规则将 ahrefs.com 的数据转发到 [**http://127.0.0.1:38080**](http://127.0.0.1:38080/) 。

通过 ZeroOmega 将 ahrefs.com 的请求转发到上边的 ahrefs_interceptor.py

打开 ZeroOmega，左下角 "新建情景模式"：

#### **情景模式 xx-global 将流量转发到你原来的 xx 工具**

- 名称( xx-global ) -&gt; 选择情景模式的类型(代理服务器) -&gt; 创建;
- 代理协议( HTTP or SOCKS ) -&gt; 代理服务器( 127.0.0.1 ) -&gt; 代理端口( xx 的本地端口 ); 我的长这样：

  ![image.png](https://s.web.cafe/image/920ed54bc549486d8c1a3cd02c00d6b2.png)

#### **情景模式 mitm-global 将流量转发到上边 ahrefs_interceptor.py 脚本**

- 名称( mitm-global ) -&gt; 选择情景模式的类型(代理服务器) -&gt; 创建;
- 代理协议( HTTP ) -&gt; 代理服务器( 127.0.0.1 ) -&gt; 代理端口( 38080 );

  ![image.png](https://s.web.cafe/image/7407066dcd6b4241a85a043046cc0757.png)

#### **mitm-auto 对 ahrefs 和 其它流量进行分流**

左下角 "新建情景模式"：

- 名称( mitm-auto ) -&gt; 选择情景模式的类型( 自动切换模式 ) -&gt; 创建；
- 添加条件 - 域名通配符 - 条件设置( ahrefs.com ) - 情景模式( 选择上一步的 mitm-global );
- 默认情景模式( 选择上边的 xx-global )。

![image.png](https://s.web.cafe/image/2b6cf1874d834eee953c97f247cb4f83.png)在 ZeroOmega 插件中选择 mitm-auto ，后续访问 ahrefs 查询反链时，原始 JSON 数据会自动保存到本地 `cache_dir/backlinks/$日期` 目录下，至于如何处理数据就自由发挥了。

## **最后**

希望大家上站过程中，不再苦于没有外链可发。

另外 Google 对网站的排名对我们来说是一个大黑盒，是多种因素综合计算的结果。

外链虽好，切勿贪多。

不信你看 [**https://www.crazygamesonline.com/**](https://www.crazygamesonline.com/) : ahrefs 显示的外链：

![image.png](https://s.web.cafe/image/d1a45c9bf9cb42a38921b4d1e123ef00.png)semrush 显示的外链：

![image.png](https://s.web.cafe/image/d2b09a0825a14688b4a91c9b7711ba0a.png)外链数量倒是挺多，一看流量......，当然这个网站不一定是外链导致没流量的。

![image.png](https://s.web.cafe/image/024447c47e974e3b9fb16f6ca296df2f.png)![image.png](https://s.web.cafe/image/039dff95dbb240d993ffa846a65e77b0.png)[**上一篇: 2025 年 2 月新词大赛-第二名-刀刀 的经验分享**](https://new.web.cafe/tutorial/detail/bhzuf9q1rs)

**评论区**

- **胖逆安同**

  2025-03-23 21:11

  回复

  学到了，全是骚操作

- **胖逆安同**

  2025-03-23 21:24

  回复

  由于我是小白，所以后半部分看得有点懵逼，去问了下ai，现在明白了，大致的意思就是，介绍了这套找词顺便收集外链的方法，后半部分介绍怎么自动化。

  具体AI的回答： 这篇文章后半部分主要讲的是如何利用自动化工具来简化和加速外链收集的过程，也就是说，把原本手动在 ahrefs 网站上查询、复制外链数据的步骤，自动化成一个工具链。下面分点详细说明：

  1. 总体思路\
     之前的方法是手动操作：先查关键词、找到目标网站，再去 ahrefs 用 Bookmarklet 打开对应外链查询页面，然后复制粘贴数据。文章后半部分的目标就是让这过程自动化——通过拦截 ahrefs 接口返回的数据，自动把外链信息保存到本地，方便后续筛选和使用。

  2. 利用 mitmproxy 拦截 API 请求\
     作者使用了 mitmproxy 这个工具来拦截浏览器发向 ahrefs 的 API 请求。\
     • 安装并配置 mitmproxy 后，启动一个脚本（ahrefs_interceptor.py）\
     • 这个脚本会监听所有发向类似 “[**https://ahrefs.com/v4/…”**](https://ahrefs.com/v4/%E2%80%A6%E2%80%9D) 的请求，判定请求路径中的最后一个部分是否在目标端点列表中（如 "stGetFreeBacklinksOverview" 或 "stGetFreeBacklinksList"）。\
     • 如果是目标请求，脚本会解析请求内容和响应内容，然后提取出请求里指定的 URL、模式（mode）等信息，并根据规则生成一个文件名。\
     • 最后，它会把返回的 JSON 数据保存到一个以当前日期为目录的本地缓存文件夹中，也就是自动保存了查询到的外链数据。

  3. 解释关键代码功能\
     • extract_domain() 和 extract_path()：这两个函数用来从 URL 中提取域名和路径信息，方便构造有意义的文件名，帮助区分不同网站的外链数据。\
     • AhrefsInterceptor 类：这个类主要负责处理 ahrefs 请求的响应，通过 response() 方法判断符合条件的 API 调用，然后保存这些响应数据到本地缓存。\
     • 缓存目录的管理：每天的数据会被保存在一个单独的子目录中，这样数据管理和后续处理会更加清晰。

  4. 利用 ZeroOmega 进行请求分发\
     为了让拦截过程不影响你原有的浏览体验，作者推荐使用 ZeroOmega（一个 Chrome 浏览器插件，类似 SwitchyOmega）来做请求分发。\
     • 你可以创建一个新的情景模式（profile），把对 ahrefs.com 的请求转发到本地运行的 mitmproxy 服务器（例如 127.0.0.1:38080）。\
     • 同时保留其他流量的正常代理配置。\
     • 简单来说，当你在浏览器里访问 ahrefs 查询外链时，ZeroOmega 会自动把请求指向 mitmproxy，进而触发上面的拦截流程，自动保存数据，而你本身照常操作，无需额外调整。

  5. 自动化后的好处\
     • 你不再需要手动点击 Bookmarklet，多次操作，拷贝粘贴数据。\
     • 无论你查询多少个网站的外链，数据都会自动保存到指定的本地位置。\
     • 后续可以根据保存下来 JSON 数据进行进一步筛选和统计，比如根据 DR 分数高低去挑选高质量外链。\
     • 整体提升了外链收集的效率，特别适合需要长时间、大量收集数据的场景。

  6. 总结\
     如果你原来是手动“找词、上站、抄同行、复制外链数据”这样的流程，那么这套自动化方案就是把这个过程流线化。一方面利用 ahrefs 免费的 API 接口数据，另一方面借助 mitmproxy 拦截并保存数据，再结合 ZeroOmega 进行智能流量转发，整个流程就可以在你查关键词的时候自动采集并存储好外链数据，后续筛选和使用时只需在本地文件里查看 JSON 数据，非常方便快捷。