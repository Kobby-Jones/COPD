"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Settings as SettingsIcon, Shield, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/context/authStore";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "system", label: "System", icon: SettingsIcon },
  { id: "security", label: "Security", icon: Shield },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
        checked ? "bg-clinical-blue" : "bg-border")}>
      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
        checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

function NotifRow({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <ToggleSwitch checked={on} onChange={setOn} />
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, preferences, and system configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-48 shrink-0">
          <div className="space-y-1">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all",
                  activeTab === tab.id ? "bg-clinical-blue-light text-clinical-blue font-medium" : "text-muted-foreground hover:bg-secondary")}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="clinical-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl mb-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-clinical-blue to-[#0EA5E9] flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {user ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.role} — {user?.department}</div>
                    <Button variant="outline" size="sm" className="mt-2 h-7 text-xs gap-1.5">
                      <Upload className="w-3 h-3" /> Change Photo
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">First Name</Label><Input defaultValue="Sarah" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Last Name</Label><Input defaultValue="Mitchell" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Title / Role</Label><Input defaultValue="Pulmonologist" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Medical License</Label><Input defaultValue="MD-2019-04821" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue="s.mitchell@citymedical.org" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Department</Label><Input defaultValue="Respiratory Medicine" /></div>
                </div>
                <Button onClick={handleSave} className="mt-4 bg-clinical-blue hover:bg-[#1557A0] gap-2">
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="clinical-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-1">Notification Preferences</h3>
                <p className="text-xs text-muted-foreground mb-4">Configure which events trigger notifications</p>
                <NotifRow label="High-Risk Patient Alerts" desc="Notify when patient is classified as high or critical risk" defaultOn={true} />
                <NotifRow label="Daily Prediction Summary" desc="Email digest of all predictions each morning at 8 AM" defaultOn={true} />
                <NotifRow label="Model Update Notifications" desc="Alert when AI model is retrained or accuracy changes" defaultOn={false} />
                <NotifRow label="Follow-up Reminders" desc="Remind 24 hours before scheduled patient follow-ups" defaultOn={true} />
                <NotifRow label="Weekly Analytics Report" desc="Summary of prediction trends and cohort changes" defaultOn={false} />
                <Button onClick={handleSave} className="mt-4 bg-clinical-blue hover:bg-[#1557A0] gap-2">
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Preferences"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="clinical-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">System Preferences</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Default Risk Threshold</Label>
                    <select className="w-full h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none">
                      <option>Standard (60%)</option>
                      <option selected>Sensitive (50%)</option>
                      <option>Conservative (70%)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Display Language</Label>
                    <select className="w-full h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Date Format</Label>
                    <select className="w-full h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none">
                      <option>MM/DD/YYYY</option>
                      <option selected>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Session Timeout</Label>
                    <select className="w-full h-9 border border-border rounded-lg px-3 text-sm bg-card text-foreground focus:outline-none">
                      <option>15 minutes</option>
                      <option selected>30 minutes</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="text-xs font-semibold text-clinical-blue mb-1">AI Model Configuration</div>
                  <div className="text-xs text-blue-700">Model: GradientBoost Ensemble v2.4.1 &nbsp;·&nbsp; Training: March 2026 &nbsp;·&nbsp; Cases: 18,442 &nbsp;·&nbsp; Features: 24</div>
                </div>
                <Button onClick={handleSave} className="mt-4 bg-clinical-blue hover:bg-[#1557A0] gap-2">
                  {saved ? <><Check className="w-4 h-4" /> Applied!</> : "Apply Settings"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="clinical-card p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Security Settings</h3>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="space-y-1.5"><Label className="text-xs">Current Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div />
                  <div className="space-y-1.5"><Label className="text-xs">New Password</Label><Input type="password" placeholder="••••••••" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Confirm New Password</Label><Input type="password" placeholder="••••••••" /></div>
                </div>
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Two-Factor Authentication", desc: "Require 2FA for every login — HIPAA recommended", on: true },
                    { label: "Session Alerts", desc: "Email notification on new device login", on: true },
                    { label: "Audit Log", desc: "Log all patient data access for compliance", on: true },
                  ].map(({ label, desc, on }) => {
                    const [checked, setChecked] = useState(on);
                    return (
                      <div key={label} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-foreground">{label}</div>
                          <div className="text-xs text-muted-foreground">{desc}</div>
                        </div>
                        <ToggleSwitch checked={checked} onChange={setChecked} />
                      </div>
                    );
                  })}
                </div>
                <Button onClick={handleSave} className="bg-clinical-blue hover:bg-[#1557A0] gap-2">
                  {saved ? <><Check className="w-4 h-4" /> Updated!</> : <><Shield className="w-4 h-4" /> Update Security</>}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
