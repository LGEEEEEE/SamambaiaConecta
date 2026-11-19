import { MapPin, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';

export default function ModalBoasVindas({ aberto, onFechar }) {
  if (!aberto) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1050 }}
        onClick={onFechar}
      />

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-light border border-secondary">
            <div className="modal-header border-secondary-subtle">
              <div>
                <span className="badge text-bg-primary mb-1">Samambaia • DF</span>
                <h5 className="modal-title fw-bold">Bem-vindo ao Samambaia Conecta</h5>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Fechar"
                onClick={onFechar}
              />
            </div>

            <div className="modal-body d-flex flex-column gap-3">
              <p className="small text-secondary mb-1">
                Plataforma comunitária para mapear demandas urbanas e divulgar eventos nas quadras de Samambaia.
              </p>

              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded bg-danger-subtle text-danger">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="fw-semibold small">Registre Problemas Urbanos</div>
                  <div className="small text-secondary">
                    Marque buracos, postes apagados ou lixo no mapa com foto e GPS/CEP automático.
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded bg-primary-subtle text-primary">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="fw-semibold small">Agenda Comunitária</div>
                  <div className="small text-secondary">
                    Divulgue e acompanhe ações sociais, feiras e eventos locais.
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="p-2 rounded bg-info-subtle text-info">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="fw-semibold small">Avalie o Projeto</div>
                  <div className="small text-secondary">
                    Use a aba <strong>Avaliar Portal</strong> para deixar sua opinião sobre a ferramenta.
                  </div>
                </div>
              </div>

              <div className="border-top border-secondary-subtle pt-2 small text-secondary d-flex align-items-center gap-1">
                <MapPin size={13} className="text-info" />
                <span>Iniciativa de Extensão (UCB) • Piloto QR 406 (GS Locações e Festas)</span>
              </div>
            </div>

            <div className="modal-footer border-secondary-subtle">
              <button
                type="button"
                className="btn btn-primary btn-sm w-100 fw-semibold"
                onClick={onFechar}
              >
                Começar a usar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}