/**
 * Windows Installer Configuration for Los Santos Penal Code
 * Advanced NSIS installer with custom features and branding
 */

const { build } = require('electron-builder');
const path = require('path');
const fs = require('fs');

class WindowsInstaller {
    constructor() {
        this.appName = 'Los Santos Penal Code';
        this.appId = 'com.lossantos.penalcode';
        this.version = require('../package.json').version;
        this.description = 'Los Santos Penal Code Desktop Application with Fine & Jail Calculator';
        this.copyright = 'Copyright © 2025 Los Santos Legal Department';
    }

    /**
     * Get installer configuration
     */
    getConfig() {
        return {
            appId: this.appId,
            productName: this.appName,
            copyright: this.copyright,
            
            directories: {
                output: 'dist',
                buildResources: 'build'
            },
            
            files: [
                '**/*',
                '!src/**/*',
                '!build/**/*',
                '!dist/**/*',
                '!node_modules/**/*',
                // Include only necessary node_modules
                'node_modules/better-sqlite3/**/*',
                'node_modules/puppeteer-core/**/*',
                '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
                '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
                '!**/node_modules/*.d.ts',
                '!**/node_modules/.bin',
                '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
                '!.editorconfig',
                '!**/._*',
                '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
                '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
                '!**/{appveyor.yml,.travis.yml,circle.yml}',
                '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
            ],
            
            extraFiles: [
                {
                    from: 'database/',
                    to: 'database',
                    filter: ['**/*', '!*.db-wal', '!*.db-shm']
                },
                {
                    from: 'data/',
                    to: 'data'
                }
            ],
            
            // Windows-specific configuration
            win: {
                target: [
                    {
                        target: 'nsis',
                        arch: ['x64', 'ia32']
                    },
                    {
                        target: 'portable',
                        arch: ['x64']
                    },
                    {
                        target: 'zip',
                        arch: ['x64', 'ia32']
                    }
                ],
                icon: 'assets/icon.ico',
                requestedExecutionLevel: 'asInvoker',
                artifactName: '${productName}-${version}-${arch}.${ext}',
                publisherName: 'Los Santos Legal Department',
                verifyUpdateCodeSignature: false,
                
                // File associations
                fileAssociations: [
                    {
                        ext: 'lspc',
                        name: 'Los Santos Penal Code File',
                        description: 'Los Santos Penal Code Document',
                        icon: 'assets/file-icon.ico',
                        role: 'Editor'
                    }
                ],
                
                // Registry entries
                extraResources: [
                    {
                        from: 'build/registry/',
                        to: 'registry'
                    }
                ]
            },
            
            // NSIS installer configuration
            nsis: {
                oneClick: false,
                perMachine: false,
                allowElevation: true,
                allowToChangeInstallationDirectory: true,
                installerIcon: 'assets/installer-icon.ico',
                uninstallerIcon: 'assets/uninstaller-icon.ico',
                installerHeaderIcon: 'assets/installer-header.ico',
                installerSidebar: 'assets/installer-sidebar.bmp',
                uninstallerSidebar: 'assets/uninstaller-sidebar.bmp',
                createDesktopShortcut: true,
                createStartMenuShortcut: true,
                shortcutName: this.appName,
                runAfterFinish: true,
                
                // Custom NSIS script
                include: 'build/installer.nsh',
                
                // License
                license: 'LICENSE.txt',
                
                // Languages
                language: ['1033', '1057'], // English, Indonesian
                
                // Custom installer/uninstaller scripts
                script: 'build/installer-script.nsis',
                uninstallScript: 'build/uninstaller-script.nsis',
                
                // Installer customization
                warningsAsErrors: false,
                displayLanguageSelector: true,
                multiLanguageInstaller: true,
                
                // Advanced options
                deleteAppDataOnUninstall: false,
                menuCategory: 'Legal Tools',
                
                // Custom pages
                customInstallPage: 'build/custom-install-page.nsh',
                customUninstallPage: 'build/custom-uninstall-page.nsh'
            },
            
            // Portable app configuration
            portable: {
                artifactName: '${productName}-${version}-portable.${ext}',
                requestedExecutionLevel: 'asInvoker'
            },
            
            // Code signing (optional)
            // forceCodeSigning: false,
            
            // Metadata
            extraMetadata: {
                main: 'main.js',
                homepage: 'https://lossantos.legal/penal-code',
                author: {
                    name: 'Los Santos Legal Department',
                    email: 'legal@lossantos.gov'
                },
                license: 'MIT',
                repository: {
                    type: 'git',
                    url: 'https://github.com/lossantos/penal-code-desktop.git'
                },
                keywords: [
                    'penal code',
                    'legal',
                    'calculator',
                    'desktop',
                    'law enforcement',
                    'legal research',
                    'fine calculator',
                    'jail calculator'
                ]
            },
            
            // Build configuration
            buildDependenciesFromSource: false,
            nodeGypRebuild: false,
            npmRebuild: true,
            
            // Compression
            compression: 'maximum',
            
            // Auto-updater
            publish: null, // Disable auto-publishing
            
            // Debugging
            buildVersion: this.version,
            detectUpdateChannel: false
        };
    }

    /**
     * Create custom NSIS includes
     */
    createNSISIncludes() {
        const buildDir = path.join(__dirname);
        
        // Ensure build directory exists
        if (!fs.existsSync(buildDir)) {
            fs.mkdirSync(buildDir, { recursive: true });
        }

        // Create installer.nsh
        const installerNsh = `
; Los Santos Penal Code Installer Customizations
!include "MUI2.nsh"
!include "FileFunc.nsh"

; Custom installer header
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "\${NSISDIR}\\Contrib\\Graphics\\Header\\nsis3-branding.bmp"
!define MUI_HEADERIMAGE_RIGHT

; Custom colors
!define MUI_BGCOLOR 0x1e1e1e
!define MUI_TEXTCOLOR 0xe0e0e0

; Custom functions
Function .onInit
    ; Check for previous installation
    ReadRegStr $R0 HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{${UNINSTALL_APP_KEY}}" "UninstallString"
    StrCmp $R0 "" done
    
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \\
        "Los Santos Penal Code is already installed. $\\n$\\nClick OK to remove the previous version or Cancel to cancel this upgrade." \\
        IDOK uninst
    Abort
    
    uninst:
        ClearErrors
        ExecWait '$R0 _?=$INSTDIR'
        
        IfErrors no_remove_label done
        no_remove_label:
            MessageBox MB_OK|MB_ICONSTOP "Failed to uninstall previous version."
            Abort
    done:
FunctionEnd

; Database initialization
Function InitDatabase
    SetOutPath "$INSTDIR\\database"
    
    ; Copy database files if they don't exist
    IfFileExists "$INSTDIR\\database\\penal-code.db" skip_db_init
        File "\${SOURCE_DIR}\\database\\*.db"
        File "\${SOURCE_DIR}\\database\\*.sql"
    skip_db_init:
FunctionEnd

; Registry entries for file associations
Function RegisterFileAssociations
    WriteRegStr HKCR ".lspc" "" "LosAntosPenalCode"
    WriteRegStr HKCR "LosAntosPenalCode" "" "Los Santos Penal Code File"
    WriteRegStr HKCR "LosAntosPenalCode\\DefaultIcon" "" "$INSTDIR\\${APP_EXECUTABLE},0"
    WriteRegStr HKCR "LosAntosPenalCode\\shell\\open\\command" "" '"$INSTDIR\\${APP_EXECUTABLE}" "%1"'
FunctionEnd

; Create additional shortcuts
Function CreateAdditionalShortcuts
    CreateDirectory "$SMPROGRAMS\\Los Santos Legal Tools"
    CreateShortcut "$SMPROGRAMS\\Los Santos Legal Tools\\Los Santos Penal Code.lnk" "$INSTDIR\\${APP_EXECUTABLE}"
    CreateShortcut "$SMPROGRAMS\\Los Santos Legal Tools\\Uninstall Los Santos Penal Code.lnk" "$INSTDIR\\Uninstall.exe"
FunctionEnd
`;

        fs.writeFileSync(path.join(buildDir, 'installer.nsh'), installerNsh);

        // Create custom install page
        const customInstallPage = `
; Custom installation page for Los Santos Penal Code
Page custom CustomInstallPage CustomInstallPageLeave

Function CustomInstallPage
    !insertmacro MUI_HEADER_TEXT "Installation Options" "Choose additional installation options"
    
    nsDialogs::Create 1018
    Pop $0
    
    \${NSD_CreateCheckBox} 10 20 200 12 "Create Desktop Shortcut"
    Pop $DesktopShortcut
    \${NSD_SetState} $DesktopShortcut \${BST_CHECKED}
    
    \${NSD_CreateCheckBox} 10 40 200 12 "Associate .lspc files"
    Pop $FileAssociation
    \${NSD_SetState} $FileAssociation \${BST_CHECKED}
    
    \${NSD_CreateCheckBox} 10 60 200 12 "Install for all users"
    Pop $AllUsers
    
    \${NSD_CreateCheckBox} 10 80 200 12 "Add to Windows Firewall exceptions"
    Pop $FirewallException
    
    nsDialogs::Show
FunctionEnd

Function CustomInstallPageLeave
    \${NSD_GetState} $DesktopShortcut $CreateDesktop
    \${NSD_GetState} $FileAssociation $AssociateFiles
    \${NSD_GetState} $AllUsers $InstallForAll
    \${NSD_GetState} $FirewallException $AddFirewallException
FunctionEnd
`;

        fs.writeFileSync(path.join(buildDir, 'custom-install-page.nsh'), customInstallPage);

        // Create installer script
        const installerScript = `
; Los Santos Penal Code Custom Installer Script
!include "installer.nsh"

Section "Main Application" SecMain
    Call InitDatabase
    Call RegisterFileAssociations
    Call CreateAdditionalShortcuts
SectionEnd

Section "Documentation" SecDocs
    SetOutPath "$INSTDIR\\docs"
    File /r "\${SOURCE_DIR}\\docs\\*.*"
SectionEnd

Section "Sample Data" SecSamples
    SetOutPath "$INSTDIR\\samples"
    File /r "\${SOURCE_DIR}\\samples\\*.*"
SectionEnd

; Uninstaller section
Section "Uninstall"
    ; Remove file associations
    DeleteRegKey HKCR ".lspc"
    DeleteRegKey HKCR "LosAntosPenalCode"
    
    ; Remove application files
    RMDir /r "$INSTDIR"
    
    ; Remove shortcuts
    Delete "$DESKTOP\\Los Santos Penal Code.lnk"
    RMDir /r "$SMPROGRAMS\\Los Santos Legal Tools"
    
    ; Remove registry entries
    DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Los Santos Penal Code"
SectionEnd
`;

        fs.writeFileSync(path.join(buildDir, 'installer-script.nsis'), installerScript);

        console.log('NSIS includes created successfully');
    }

    /**
     * Create application icons
     */
    createIcons() {
        const iconsDir = path.join(__dirname, '..', 'assets');
        
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir, { recursive: true });
        }

        // Note: In a real implementation, you would create actual .ico files
        // For now, we'll create placeholder files that indicate where icons should be placed
        const iconPlaceholders = [
            'icon.ico',
            'installer-icon.ico',
            'uninstaller-icon.ico',
            'installer-header.ico',
            'file-icon.ico'
        ];

        iconPlaceholders.forEach(iconName => {
            const iconPath = path.join(iconsDir, iconName);
            if (!fs.existsSync(iconPath)) {
                fs.writeFileSync(iconPath, `; Placeholder for ${iconName}\n; Replace with actual icon file`);
            }
        });

        console.log('Icon placeholders created');
    }

    /**
     * Build Windows installer
     */
    async buildInstaller() {
        try {
            console.log('Creating NSIS includes...');
            this.createNSISIncludes();
            
            console.log('Creating icon placeholders...');
            this.createIcons();
            
            console.log('Building Windows installer...');
            const config = this.getConfig();
            
            const result = await build({
                targets: [
                    {
                        platform: 'win32',
                        arch: 'x64'
                    }
                ],
                config: config,
                publish: 'never'
            });

            console.log('Windows installer built successfully!');
            console.log('Output files:', result);
            
            return result;
        } catch (error) {
            console.error('Error building Windows installer:', error);
            throw error;
        }
    }

    /**
     * Create distribution package
     */
    async createDistribution() {
        try {
            // Build for multiple architectures
            const targets = [
                { platform: 'win32', arch: 'x64' },
                { platform: 'win32', arch: 'ia32' }
            ];

            const results = [];
            
            for (const target of targets) {
                console.log(`Building for ${target.platform} ${target.arch}...`);
                
                const result = await build({
                    targets: [target],
                    config: this.getConfig(),
                    publish: 'never'
                });
                
                results.push(result);
            }

            console.log('All distributions built successfully!');
            return results;
        } catch (error) {
            console.error('Error creating distribution:', error);
            throw error;
        }
    }

    /**
     * Validate build environment
     */
    validateEnvironment() {
        const requirements = [
            { name: 'Node.js', check: () => process.version },
            { name: 'NPM', check: () => require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim() },
            { name: 'Electron Builder', check: () => require('electron-builder/package.json').version }
        ];

        console.log('Validating build environment...');
        
        requirements.forEach(req => {
            try {
                const version = req.check();
                console.log(`✓ ${req.name}: ${version}`);
            } catch (error) {
                console.error(`✗ ${req.name}: Not found or error`);
                throw new Error(`Missing requirement: ${req.name}`);
            }
        });

        console.log('Build environment validation complete');
    }

    /**
     * Clean build directory
     */
    cleanBuild() {
        const distDir = path.join(__dirname, '..', 'dist');
        
        if (fs.existsSync(distDir)) {
            fs.rmSync(distDir, { recursive: true, force: true });
            console.log('Cleaned build directory');
        }
    }

    /**
     * Get build information
     */
    getBuildInfo() {
        return {
            appName: this.appName,
            version: this.version,
            buildDate: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };
    }
}

// Export for use in package.json scripts
module.exports = WindowsInstaller;

// Command line interface
if (require.main === module) {
    const installer = new WindowsInstaller();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'build':
            installer.validateEnvironment();
            installer.buildInstaller().catch(console.error);
            break;
            
        case 'dist':
            installer.validateEnvironment();
            installer.createDistribution().catch(console.error);
            break;
            
        case 'clean':
            installer.cleanBuild();
            break;
            
        case 'info':
            console.log(JSON.stringify(installer.getBuildInfo(), null, 2));
            break;
            
        case 'validate':
            installer.validateEnvironment();
            break;
            
        default:
            console.log(`
Los Santos Penal Code - Windows Installer Builder

Usage:
  node build/installer.js <command>

Commands:
  build     Build Windows installer (x64 only)
  dist      Build all distributions (x64 + ia32)
  clean     Clean build directory
  info      Show build information
  validate  Validate build environment

Examples:
  node build/installer.js build
  node build/installer.js dist
  npm run build-win
            `);
    }
}
