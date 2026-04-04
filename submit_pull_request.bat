@echo off
cd /d "%~dp0"

echo ========================================================
echo PREPARING TO PUSH PHASE 3 FMF PLATFORM UPDATES
echo ========================================================
echo.

:: Check if git is installed and in PATH
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not active in your system PATH.
    echo Please install Git from https://git-scm.com/ or restart your computer if you just installed it.
    echo.
    pause
    exit /b
)

:: Check if this folder is an active Git repository
if not exist ".git\" (
    echo ERROR: No valid Git repository detected in this folder.
    echo Make sure you are running this from the root project folder containing the `.git` directory.
    echo.
    pause
    exit /b
)

echo 1. Loading current branch status...
git status
echo.

echo 2. Staging all modified files...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to stage files. Check if files are locked by another program.
    pause
    exit /b
)
echo [Done]
echo.

echo 3. Committing changes...
git commit -m "Phase 3 Connectivity"
if %errorlevel% neq 0 (
    echo NOTE: No new changes to commit or commit failed. Moving to push step...
) else (
    echo [Done]
)
echo.

echo 4. Pushing branch to origin...
git push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push to the repository. You may need to authenticate or set an upstream branch.
    pause
    exit /b
)
echo [Done]
echo.

echo ========================================================
echo UPDATE SUCCESSFUL!
echo Everything is safely uploaded. You can now open a Pull 
echo Request directly from the GitHub repository website.
echo ========================================================
pause
