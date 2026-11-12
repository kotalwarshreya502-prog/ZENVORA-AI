@echo off
cd /d "E:\Youtube Workspace\ZENVORA-AI"
git add -A
git commit -m "fix(auth): surface exact backend error messages on register/login; add already-exists hint with login link; fix error propagation in AuthContext; add real image gen, research, competitor analysis, generation history backend"
git push origin main
echo Done!
pause
