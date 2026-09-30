// widget/widget-task-handler.js
import React from 'react';
import { MiadWidget, MiadWidgetHata } from './MiadWidget';
import { getirWidgetVerisi, hesapla, tarihMetni } from './vakitHelper';

export async function widgetTaskHandler(props) {
  const { widgetAction, renderWidget, widgetInfo } = props;

  if (!['WIDGET_ADDED', 'WIDGET_UPDATE', 'WIDGET_RESIZED'].includes(widgetAction)) {
    return;
  }

  // KRİTİK: Bu try/catch olmazsa herhangi bir veri hatasında widget
  // tamamen boş/görünmez kalır. Artık en kötü ihtimalle bir hata mesajı gösterir.
  try {
    const now = new Date();
    const { sehirAdi, vakitler } = await getirWidgetVerisi();
    const h = hesapla(vakitler, now);

    renderWidget(
      <MiadWidget
        vakitler={vakitler}
        suAnId={h.suAnId}
        sehir={sehirAdi}
        tarih={tarihMetni(now)}
        width={widgetInfo?.width}
      />
    );
  } catch (e) {
    console.log('Miad widget render hatası:', e);
    try {
      renderWidget(<MiadWidgetHata />);
    } catch (e2) {
      // renderWidget'ın kendisi bile çöküyorsa yapacak bir şey yok,
      // ama en azından loglanır.
      console.log('Miad widget fallback render hatası:', e2);
    }
  }
}
