import React from 'react';
import { Building2, Edit3, Globe, Mail, Phone, X, CheckCircle, Trash2, Info } from 'lucide-react';
import { OrganizationInfo } from '../types';

interface OrganizationProfilePanelProps {
  organizationInfo?: OrganizationInfo;
  onSave: (next: OrganizationInfo | undefined) => Promise<void> | void;
}

const emptyOrganization: OrganizationInfo = {
  name: '',
  description: '',
  website: '',
  city: '',
  country: '',
  contactName: '',
  contactEmail: '',
  contactPhone: ''
};

const hasMeaningfulContent = (info: OrganizationInfo) => {
  return [
    info.name,
    info.description,
    info.website,
    info.city,
    info.country,
    info.contactName,
    info.contactEmail,
    info.contactPhone
  ].some((value) => Boolean(value && value.trim()));
};

const sanitizeInfo = (info: OrganizationInfo): OrganizationInfo => ({
  name: info.name?.trim() || '',
  description: info.description?.trim() || '',
  website: info.website?.trim() || '',
  city: info.city?.trim() || '',
  country: info.country?.trim() || '',
  contactName: info.contactName?.trim() || '',
  contactEmail: info.contactEmail?.trim() || '',
  contactPhone: info.contactPhone?.trim() || ''
});

export const OrganizationProfilePanel: React.FC<OrganizationProfilePanelProps> = ({ organizationInfo, onSave }) => {
  const [isEditing, setIsEditing] = React.useState(!organizationInfo);
  const [formValues, setFormValues] = React.useState<OrganizationInfo>(
    organizationInfo ? { ...emptyOrganization, ...organizationInfo } : { ...emptyOrganization }
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = React.useState('');

  const fingerprint = React.useMemo(() => JSON.stringify(organizationInfo || {}), [organizationInfo]);

  React.useEffect(() => {
    if (organizationInfo) {
      setFormValues({ ...emptyOrganization, ...organizationInfo });
      setIsEditing(false);
    } else {
      setFormValues({ ...emptyOrganization });
      setIsEditing(true);
    }
    setStatus('idle');
    setStatusMessage('');
  }, [fingerprint]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = sanitizeInfo(formValues);
    const payload = hasMeaningfulContent(normalized) ? normalized : undefined;
    setIsSaving(true);
    setStatus('idle');
    setStatusMessage('');
    try {
      await onSave(payload);
      setStatus('success');
      setStatusMessage(payload ? 'Organization profile saved' : 'Organization profile cleared');
      if (payload) {
        setIsEditing(false);
      } else {
        setFormValues({ ...emptyOrganization });
        setIsEditing(true);
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err?.message || 'Could not save organization profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormValues(organizationInfo ? { ...emptyOrganization, ...organizationInfo } : { ...emptyOrganization });
    setIsEditing(Boolean(!organizationInfo));
    setStatus('idle');
    setStatusMessage('');
  };

  const handleClear = async () => {
    if (!organizationInfo) {
      setFormValues({ ...emptyOrganization });
      return;
    }
    if (!window.confirm('Remove organization info from this workspace?')) return;
    setIsSaving(true);
    setStatus('idle');
    setStatusMessage('');
    try {
      await onSave(undefined);
      setFormValues(emptyOrganization);
      setIsEditing(true);
      setStatus('success');
      setStatusMessage('Organization profile cleared');
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err?.message || 'Could not clear organization profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white border-2 border-black rounded-none shadow-[6px_6px_0_0_#0f172a]">
      <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-white text-slate-900 p-2 border-2 border-black rounded-none">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest font-semibold">Organization Profile</p>
            <p className="text-xs text-slate-200">Used for press releases + formal copy</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center text-xs font-semibold bg-white text-slate-900 px-3 py-1 border-2 border-black rounded-none hover:bg-slate-100"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Edit
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {status !== 'idle' && (
          <div
            className={`flex items-center gap-2 text-sm border-2 rounded-none px-3 py-2 ${
              status === 'success'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                : 'bg-rose-50 border-rose-600 text-rose-900'
            }`}
          >
            {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {!isEditing && organizationInfo && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Boilerplate</p>
              <p className="mt-1 text-slate-900 font-medium">{organizationInfo.name || '—'}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {organizationInfo.description || 'No boilerplate provided yet.'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-slate-700">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>{organizationInfo.website || 'Website not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                <span>
                  {(organizationInfo.city || 'City')} · {(organizationInfo.country || 'Country')}
                </span>
              </div>
              {organizationInfo.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{organizationInfo.contactEmail}</span>
                </div>
              )}
              {organizationInfo.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{organizationInfo.contactPhone}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
              <div>
                <p className="text-xs uppercase font-semibold text-slate-500">Media Contact</p>
                <p className="text-sm text-slate-900">
                  {organizationInfo.contactName || 'Not specified'}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                disabled={isSaving}
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Organization Name
              </label>
              <input
                type="text"
                className="w-full border-2 border-black rounded-none px-3 py-2 text-sm"
                placeholder="Modern Art Gallery"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-black rounded-none px-3 py-2 text-sm"
                  placeholder="Paris"
                  value={formValues.city}
                  onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-black rounded-none px-3 py-2 text-sm"
                  placeholder="France"
                  value={formValues.country}
                  onChange={(e) => setFormValues({ ...formValues, country: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Website
              </label>
              <input
                type="url"
                className="w-full border-2 border-black rounded-none px-3 py-2 text-sm"
                placeholder="https://gallery.com"
                value={formValues.website}
                onChange={(e) => setFormValues({ ...formValues, website: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                Boilerplate / About
              </label>
              <textarea
                className="w-full border-2 border-black rounded-none px-3 py-2 text-sm min-h-[96px]"
                placeholder="2-3 sentence description for the press release footer"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
              />
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Media Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  className="border-2 border-black rounded-none px-3 py-2 text-xs"
                  placeholder="Contact name"
                  value={formValues.contactName}
                  onChange={(e) => setFormValues({ ...formValues, contactName: e.target.value })}
                />
                <input
                  type="email"
                  className="border-2 border-black rounded-none px-3 py-2 text-xs"
                  placeholder="contact@studio.com"
                  value={formValues.contactEmail}
                  onChange={(e) => setFormValues({ ...formValues, contactEmail: e.target.value })}
                />
                <input
                  type="tel"
                  className="border-2 border-black rounded-none px-3 py-2 text-xs sm:col-span-2"
                  placeholder="+1 555 123 4567"
                  value={formValues.contactPhone}
                  onChange={(e) => setFormValues({ ...formValues, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 border-2 border-black rounded-none text-xs font-semibold bg-white hover:bg-slate-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 border-2 border-black rounded-none text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
