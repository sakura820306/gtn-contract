
import streamlit as st
import requests
import time

st.set_page_config(layout="wide")

API_BASE = "http://localhost:3000/api"
BLOCKCHAIN_URL = "http://localhost:7731"
BLOCKCHAIN_RID = "9B189AF332921D168B13B6798733893073A45409B2CE2DFEA707138BA619F444"

# 自訂樣式置中標題
st.markdown("""
    <h1 style='text-align: center; font-size: 36px;'>去中心化猜數字遊戲前端</h1>
""", unsafe_allow_html=True)

def get_recent_blocks(limit=5):
    try:
        res = requests.get(
            f"{BLOCKCHAIN_URL}/blocks/{BLOCKCHAIN_RID}",
            params={"limit": limit, "txs": True}
        )
        return res.json()
    except Exception:
        return []

def display_block_info(block, container):
    container.markdown(f"**🧱 區塊高度：{block.get('height')}**")
    container.caption(f"📦 區塊 ID：{block.get('blockRid')}")
    container.caption(f"⏱️ 時間：{block.get('timestamp')}")
    container.caption(f"📄 交易數：{len(block.get('transactions', []) or [])}")
    with container.expander("查看區塊完整內容"):
        container.json(block)

# 畫面分三欄：左=使用者欄，中=操作欄，右=區塊顯示欄
left, mid, right = st.columns([1, 2, 1])

# -------- 左欄：玩家資訊 --------
with left:
    st.header("🧑 玩家資訊")
    user_id = st.text_input("你的 User ID")
    user_name = st.text_input("你的暱稱")
    if st.button("註冊玩家"):
        try:
            res = requests.post(f"{API_BASE}/user", json={"userId": user_id, "userName": user_name})
            st.write(res.json())
        except Exception as e:
            st.error(f"註冊失敗：{e}")
    if st.button("取得點數"):
        try:
            res = requests.post(f"{API_BASE}/point", json={"userId": user_id})
            st.write(res.json())
        except Exception as e:
            st.error(f"取得點數失敗：{e}")

# -------- 中欄：操作功能 --------
with mid:
    st.header("🔧 系統初始化")
    if st.button("初始化區塊鏈發行商"):
        try:
            res = requests.post(f"{API_BASE}/issuer/init")
            st.success("初始化成功")
            st.json(res.json())
        except Exception as e:
            st.error(f"初始化失敗: {e}")

    st.header("🏗️ 建立遊戲頻道")
    channel_id = st.text_input("Channel ID")
    channel_name = st.text_input("Channel 名稱")
    if st.button("建立 Channel"):
        try:
            res = requests.post(f"{API_BASE}/channel", json={"channelId": channel_id, "channelName": channel_name})
            st.write(res.json())
        except Exception as e:
            st.error(f"建立頻道失敗：{e}")

    st.header("🎯 猜數字遊戲")
    guess_channel_id = st.text_input("猜的 Channel ID")
    guess_number = st.number_input("你的猜測（0~20）", min_value=0, max_value=20, step=1)
    if st.button("提交猜測"):
        try:
            res = requests.post(f"{API_BASE}/channel/guess", json={
                "channelId": guess_channel_id,
                "userId": user_id,
                "guessNumber": guess_number
            })
            st.write(res.json())
        except Exception as e:
            st.error(f"猜數字失敗：{e}")

    st.header("📋 查詢")
    if st.button("取得所有頻道"):
        try:
            res = requests.get(f"{API_BASE}/channels")
            st.json(res.json())
        except Exception as e:
            st.error(f"查詢頻道失敗：{e}")

    if st.button("查詢我的歷程"):
        try:
            res = requests.get(f"{API_BASE}/history/user", params={"userId": user_id})
            st.json(res.json())
        except Exception as e:
            st.error(f"查詢歷程失敗：{e}")

# -------- 右欄：區塊資訊（主迴圈更新） --------
with right:
    st.header("📊 最新區塊（每 5 秒更新）")
    block_display = st.empty()

    # 每 5 秒更新一次區塊顯示
    for _ in range(999999):
        blocks = get_recent_blocks()
        with block_display.container():
            for block in blocks:
                display_block_info(block, st)
        time.sleep(5)
