import { FoundPet } from 'src/core/db/entities/found-pet.entity';
import { LostPet } from 'src/core/db/entities/lost-pet.entity';
import { generateMapboxTwoPins } from 'src/core/utils/utils';

export const generateFoundPetEmailTemplate = (
  foundPet: FoundPet,
  lostPet: LostPet,
  distance: number,
): string => {
  const foundLon = (foundPet.location as any).coordinates[0];
  const foundLat = (foundPet.location as any).coordinates[1];
  const lostLon = (lostPet.location as any).coordinates[0];
  const lostLat = (lostPet.location as any).coordinates[1];

  const mapImageUrl = generateMapboxTwoPins(lostLat, lostLon, foundLat, foundLon);
  const distanceM = Math.round(distance);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
        .header { background: #ff7043; color: white; padding: 28px 32px; }
        .header h1 { margin: 0; font-size: 26px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 15px; }
        .body { padding: 28px 32px; }
        .section-title { font-size: 14px; font-weight: bold; color: #ff7043; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .info-item { background: #fafafa; border-radius: 6px; padding: 10px 14px; }
        .info-item .label { font-size: 11px; color: #888; margin-bottom: 2px; }
        .info-item .value { font-size: 14px; font-weight: 600; color: #333; }
        .distance-badge { display: inline-block; background: #fff3e0; color: #e65100; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 15px; margin: 16px 0; }
        .map-section { margin: 20px 0; }
        .map-section img { width: 100%; border-radius: 8px; border: 1px solid #eee; }
        .map-legend { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #666; }
        .legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
        .desc-box { background: #f9f9f9; border-left: 4px solid #ff7043; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 14px; color: #444; margin: 8px 0; }
        .contact-box { background: #e8f5e9; border-radius: 8px; padding: 16px 20px; margin-top: 16px; }
        .contact-box .name { font-size: 17px; font-weight: bold; color: #2e7d32; }
        .contact-box a { color: #1b5e20; }
        .footer { background: #f5f5f5; text-align: center; padding: 18px; font-size: 12px; color: #aaa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🐾 ¡Posible coincidencia encontrada!</h1>
          <p>Se encontró una mascota cerca de donde reportaste la pérdida de <strong>${lostPet.name}</strong></p>
        </div>
        <div class="body">

          <div class="distance-badge">📍 A solo ${distanceM} metros de donde se perdió</div>

          <div class="section-title">Mascota encontrada</div>
          <div class="info-grid">
            <div class="info-item"><div class="label">Especie</div><div class="value">${foundPet.species}</div></div>
            <div class="info-item"><div class="label">Raza</div><div class="value">${foundPet.breed || 'No identificada'}</div></div>
            <div class="info-item"><div class="label">Color</div><div class="value">${foundPet.color}</div></div>
            <div class="info-item"><div class="label">Tamaño</div><div class="value">${foundPet.size}</div></div>
            <div class="info-item"><div class="label">Dirección</div><div class="value">${foundPet.address}</div></div>
            <div class="info-item"><div class="label">Fecha encontrada</div><div class="value">${new Date(foundPet.found_date).toLocaleDateString('es-MX')}</div></div>
          </div>

          <div class="section-title">Descripción</div>
          <div class="desc-box">${foundPet.description}</div>

          <div class="section-title">Tu mascota perdida</div>
          <div class="info-grid">
            <div class="info-item"><div class="label">Nombre</div><div class="value">${lostPet.name}</div></div>
            <div class="info-item"><div class="label">Especie</div><div class="value">${lostPet.species}</div></div>
            <div class="info-item"><div class="label">Raza</div><div class="value">${lostPet.breed}</div></div>
            <div class="info-item"><div class="label">Color</div><div class="value">${lostPet.color}</div></div>
            <div class="info-item"><div class="label">Dirección perdida</div><div class="value">${lostPet.address}</div></div>
            <div class="info-item"><div class="label">Fecha pérdida</div><div class="value">${new Date(lostPet.lost_date).toLocaleDateString('es-MX')}</div></div>
          </div>

          <div class="section-title">Mapa de ubicaciones</div>
          <div class="map-section">
            <img src="${mapImageUrl}" alt="Mapa con ambas ubicaciones" />
            <div class="map-legend">
              <span><span class="legend-dot" style="background:#f00;"></span> Donde se perdió ${lostPet.name}</span>
              <span><span class="legend-dot" style="background:#0f0;"></span> Donde fue encontrada</span>
            </div>
          </div>

          <div class="section-title">Contacto del encontrador</div>
          <div class="contact-box">
            <div class="name">${foundPet.finder_name}</div>
            <div style="margin-top:6px;font-size:14px;">
              📧 <a href="mailto:${foundPet.finder_email}">${foundPet.finder_email}</a><br/>
              📞 ${foundPet.finder_phone}
            </div>
          </div>

        </div>
        <div class="footer">
          PetRadar 🐾 — Ayudando a reunir mascotas con sus familias<br/>
          Este correo fue generado automáticamente. Por favor no respondas a este mensaje.
        </div>
      </div>
    </body>
    </html>
  `;
};
