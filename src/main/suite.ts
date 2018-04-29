import { ISuite } from '../interfaces'

class Suite implements ISuite {
  fullTitle() {
    return this.title;
  }
}
