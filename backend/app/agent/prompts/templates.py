"""Prompt templates used by the agent engine and tools."""

RFQ_ENGLISH_SECTION = """REQUEST FOR QUOTATION
RFQ Number: {rfq_number}
Date: {date}

PRODUCT: {product}
QUANTITY: {quantity} units
SPECIFICATIONS: {specifications}
DEADLINE: {deadline}
TERMS: {terms}

This RFQ is issued to the following suppliers:
{supplier_list}

Please provide:
1. Unit price (USD)
2. Tooling / NRE charges
3. Lead time from order confirmation
4. Payment terms
5. Shipping terms (Incoterms)
6. Minimum order quantity (MOQ)
7. Certifications and quality assurance

Issued by: Benchlink Agentic Supply Chain Platform
"""

RFQ_CHINESE_SECTION = """询价单
询价单号：{rfq_number}
日期：{date}

产品：{product}
数量：{quantity} 件
规格：{specifications}
截止日期：{deadline}
条款：{terms}

本询价单发至以下供应商：
{supplier_list}

请提供：
1. 单价（美元）
2. 模具费/一次性工程费用
3. 确认订单后的交货周期
4. 付款条件
5. 运输条款（国际贸易术语）
6. 最小订单量（MOQ）
7. 认证及质量保证

发布方：Benchlink 智能供应链平台
"""

BOM_ANALYSIS_PROMPT = """Analyze the following bill of materials and identify the required component categories.

BOM Content:
{bom_content}

Extract:
1. Component types needed (PCB, SMT Assembly, CNC Machining, etc.)
2. Estimated quantities
3. Required finishes or special processes
4. Suggested supplier locations (GBA: Shenzhen, Guangzhou, Hong Kong)

Return a structured analysis."""

SUPPLIER_ANALYSIS_PROMPT = """Based on the following component requirements and matched suppliers, provide a sourcing recommendation.

Required Components: {components}
Matched Suppliers: {suppliers}

Analyze:
1. Top 3 supplier matches and why
2. Lead time considerations
3. Pricing comparison (HKD and USD)
4. Quality and certification assessment
5. Risk factors or concerns
6. Recommended next steps"""
