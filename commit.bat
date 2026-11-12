@echo off
cd /d "E:\Youtube Workspace\ZENVORA-AI"
git add -A
git commit -m "fix: brand-aware content generation - topic-specific prompts, separate hashtags, no hardcoded B2B defaults, brandName+industry fields in ContentStudioPage"
git push origin main
