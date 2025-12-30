import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @swagger
 * /api/info/version:
 *   get:
 *     summary: Получить информацию о версии и changelog
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Информация о версии
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                     lastCommit:
 *                       type: string
 *                     lastCommitMessage:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     commits:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Ошибка сервера
 */
router.get('/version', async (req, res) => {
  try {
    const rootDir = join(__dirname, '../../..');

    // Получаем версию из package.json
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    // Получаем последний коммит
    let lastCommit = '';
    let lastCommitMessage = '';
    try {
      const { stdout: lastCommitOutput } = await execAsync('git log -1 --format="%H|%s|%an|%ad" --date=iso', {
        cwd: rootDir,
      });
      const parts = lastCommitOutput.trim().split('|');
      lastCommit = parts[0]?.substring(0, 7) || '';
      lastCommitMessage = parts[1] || '';
    } catch (error) {
      console.warn('Не удалось получить информацию о последнем коммите:', error.message);
    }

    // Получаем все теги (версии)
    let tags = [];
    try {
      const { stdout: tagsOutput } = await execAsync('git tag -l --sort=-version:refname', {
        cwd: rootDir,
      });
      tags = tagsOutput.trim().split('\n').filter(Boolean);
    } catch (error) {
      // Если тегов нет, игнорируем ошибку
      console.warn('Не удалось получить теги:', error.message);
    }

    // Получаем последние коммиты (для changelog)
    let commits = [];
    try {
      const { stdout: commitsOutput } = await execAsync(
        'git log --format="%H%n%s%n%an%n%ad%n%b%n---COMMIT_SEPARATOR---" --date=iso -50',
        { cwd: rootDir }
      );

      const commitBlocks = commitsOutput.trim().split('---COMMIT_SEPARATOR---').filter(Boolean);
      commits = commitBlocks.map((commitBlock) => {
        const lines = commitBlock.trim().split('\n').filter(Boolean);
        if (lines.length < 4) {
          return null;
        }
        
        const hash = lines[0] || '';
        const subject = lines[1] || '';
        const author = lines[2] || '';
        const date = lines[3] || '';
        const body = lines.slice(4).join('\n').trim();
        
        return {
          hash: hash.substring(0, 7),
          fullHash: hash,
          subject,
          author,
          date,
          body,
        };
      }).filter(Boolean);
    } catch (error) {
      console.warn('Не удалось получить коммиты:', error.message);
    }

    res.json({
      success: true,
      data: {
        version,
        lastCommit,
        lastCommitMessage,
        tags,
        commits,
      },
    });
  } catch (error) {
    console.error('Ошибка получения информации о версии:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения информации о версии',
    });
  }
});

export default router;

