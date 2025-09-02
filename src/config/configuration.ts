import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

// Menentukan nama file konfigurasi. Bisa juga diambil dari environment variable.
const YAML_CONFIG_FILENAME = 'dbconfig.yml';

export default () => {
  return yaml.load(
    // Membaca file dari root direktori proyek
    readFileSync(join(process.cwd(), YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};