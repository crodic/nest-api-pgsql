import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  promises as fs,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { dirname, join } from 'path';

type Disk = 'public' | 'private';

@Injectable()
export class StorageService implements OnModuleInit {
  private basePath = join(process.cwd(), 'storage');

  onModuleInit() {
    mkdirSync(join(this.basePath, 'public'), { recursive: true });
    mkdirSync(join(this.basePath, 'private'), { recursive: true });
  }

  disk(disk: Disk) {
    return new DiskWriter(join(this.basePath, disk), disk);
  }
}

class DiskWriter {
  constructor(
    private root: string,
    private disk: Disk,
  ) {}

  fullPath(path: string) {
    return join(this.root, path);
  }

  path() {
    return this.root;
  }

  diskPath() {
    return `storage/${this.disk}`;
  }

  put(path: string, data: Buffer | string) {
    const fp = this.fullPath(path);
    mkdirSync(dirname(fp), { recursive: true });
    writeFileSync(fp, data);
    return path;
  }

  get(path: string) {
    return readFileSync(this.fullPath(path));
  }

  delete(path: string) {
    rmSync(this.fullPath(path), { force: true });
  }

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(path));
      return true;
    } catch {
      return false;
    }
  }

  url(path: string) {
    return `${this.diskPath()}/${path}`;
  }
}
