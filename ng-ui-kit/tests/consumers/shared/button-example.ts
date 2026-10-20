import {Component, signal} from '@angular/core';
import {DsButtonComponent} from '@primasoftllc/design-system/angular';

@Component({
  selector: 'app-save-example',
  standalone: true,
  imports: [DsButtonComponent],
  template: `<button dsButton icon="save" [loading]="saving()" (click)="save()">Сохранить</button>
    <p role="status">{{message()}}</p>`,
})
export class SaveExample {
  readonly saving = signal(false);
  readonly message = signal('');

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set('Сохраняем изменения…');
    try {
      // Демонстрация асинхронного действия; в приложении здесь вызов сервиса.
      await new Promise<void>(resolve => setTimeout(resolve, 500));
      this.message.set('Изменения сохранены.');
    } catch {
      this.message.set('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      this.saving.set(false);
    }
  }
}
