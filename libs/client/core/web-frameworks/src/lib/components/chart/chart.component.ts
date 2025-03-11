import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChartCustomColor, ChartResult } from '@app/client/models';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  @Input() results: ChartResult[];
  @Input() customColors: ChartCustomColor[];
}
