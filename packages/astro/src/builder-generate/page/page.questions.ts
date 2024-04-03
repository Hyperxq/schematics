import { askQuestion } from '../../../../../utils';

export async function askLayout(layouts: string[]): Promise<string> {
  const message = 'Do you want to use any layout?';
  return await askQuestion(message, ['none', ...layouts], layouts[0]);
}
