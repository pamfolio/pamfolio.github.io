# 广东海丰周末慢游 ｜ 美食、景点及历史

海丰周末旅行指南，包含美食、景点、历史资料、海鲜月历和个人行程。访客的收藏、行程和吃过手记保存在自己的浏览器中。

## 内容编辑

[在 Pages CMS 中打开本仓库](https://app.pagescms.org/pamfolio/pamfolio.github.io/main)。首页、美食、饭店、景点、海鲜月历、片区、历史和营养数据位于 `content/`，编辑表单由 `.pages.yml` 定义。新上传的图片保存在 `assets/uploads/`。

保留已有条目 ID，新增 ID 时使用不重复的英文字母、数字或连字符。修改中文后，如需同步英文界面，请更新 `language-data.js`。

## 本地预览

```bash
python3 scripts/build.py
python3 -m http.server 8000 --directory _site
```

打开 `http://localhost:8000`。构建会从 `content/` 生成静态网页，输出目录 `_site/` 由 Git 忽略。

## 检查与发布

提交内容会运行 GitHub Actions 检查。检查通过后，由站主在 Pages CMS 选择「确认发布网站」，并在对话框中点击「确认发布」。GitHub Actions 中的 `Publish Haifeng — owner confirmation` 也支持手动运行。

仓库是公开的。保存到 GitHub 后，源文件即可被浏览。访客访问的网页在发布流程成功后更新。

维护者：Pam Ye
