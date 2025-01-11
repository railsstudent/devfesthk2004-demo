import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { injectNetwork } from 'ngxtension/inject-network';
import { NETWORK_STATUS } from './enums/network-status.enum';

@Component({
  selector: 'lib-network',
  imports: [],
  template: `
    <div>
      @if (networkState.supported()) {
        <p>Online: {{ status() }}</p>
        <p>{{ statusTime() }}</p>
      } @else {
        <p>Network Information API is not supported.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkComponent {
  networkState = injectNetwork();

  status = computed(() => {
    if (this.networkState.supported()) {
      return this.networkState.online() ? NETWORK_STATUS.YES : NETWORK_STATUS.NO;
    }

    return NETWORK_STATUS.NO;
  })

  statusTime = computed(() => {
    if (this.networkState.supported()) {
      if (this.networkState.online()) { 
        const onlineAt = this.networkState.onlineAt();
        return !onlineAt ? '' : `Online at ${new Date(onlineAt).toISOString()}`;
      } else {
        const offlineAt = this.networkState.offlineAt();
        return !offlineAt ? '' : `Offline at ${new Date(offlineAt).toISOString()}`;
      }
    }

    return '';
  });
}
