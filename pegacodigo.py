import os

output_file = 'projeto_consolidado.txt'
ignore_dirs = {'node_modules', '.git', 'dist', 'build', '.vscode'}
ignore_exts = {'.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.lock'}

with open(output_file, 'w', encoding='utf-8') as outfile:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if file == output_file or file == 'package-lock.json' or any(file.endswith(ext) for ext in ignore_exts):
                continue
            path = os.path.join(root, file)
            outfile.write(f'========================================\n')
            outfile.write(f'ARQUIVO: {path}\n')
            outfile.write(f'========================================\n\n')
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    outfile.write(f.read())
            except Exception:
                outfile.write('[Arquivo não lido ou binário]\n')
            outfile.write('\n\n')

print('Concluído! Arquivo gerado: projeto_consolidado.txt')
