'use client';

import { useState, useEffect } from 'react';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Settings() {
  const { language, setLanguage, translate } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    const savedSmsNotifications = localStorage.getItem('smsNotifications');
    const savedPushNotifications = localStorage.getItem('pushNotifications');
    const savedTwoFactorAuth = localStorage.getItem('twoFactorAuth');
    const savedProfileVisibility = localStorage.getItem('profileVisibility');
    const savedDataCollection = localStorage.getItem('dataCollection');

    setTheme(savedTheme);
    setLanguage(savedLanguage as any);
    setEmailNotifications(savedEmailNotifications ? JSON.parse(savedEmailNotifications) : true);
    setSmsNotifications(savedSmsNotifications ? JSON.parse(savedSmsNotifications) : false);
    setPushNotifications(savedPushNotifications ? JSON.parse(savedPushNotifications) : true);
    setTwoFactorAuth(savedTwoFactorAuth ? JSON.parse(savedTwoFactorAuth) : false);
    setProfileVisibility(savedProfileVisibility ? JSON.parse(savedProfileVisibility) : true);
    setDataCollection(savedDataCollection ? JSON.parse(savedDataCollection) : false);

    // Apply theme immediately only if not already applied
    const isDarkApplied = document.documentElement.classList.contains('dark');
    if (savedTheme === 'dark' && !isDarkApplied) {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light' && isDarkApplied) {
      document.documentElement.classList.remove('dark');
    } else if (savedTheme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark && !isDarkApplied) {
        document.documentElement.classList.add('dark');
      } else if (!systemPrefersDark && isDarkApplied) {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [setLanguage]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
    localStorage.setItem('smsNotifications', JSON.stringify(smsNotifications));
    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));
    localStorage.setItem('twoFactorAuth', JSON.stringify(twoFactorAuth));
    localStorage.setItem('profileVisibility', JSON.stringify(profileVisibility));
    localStorage.setItem('dataCollection', JSON.stringify(dataCollection));
  }, [theme, language, emailNotifications, smsNotifications, pushNotifications, twoFactorAuth, profileVisibility, dataCollection]);

  // Apply theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      // This will trigger a re-render when language changes
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
  };

  const toggleSmsNotifications = () => {
    setSmsNotifications(!smsNotifications);
  };

  const togglePushNotifications = () => {
    setPushNotifications(!pushNotifications);
  };

  const toggleTwoFactorAuth = () => {
    setTwoFactorAuth(!twoFactorAuth);
  };

  const toggleProfileVisibility = () => {
    setProfileVisibility(!profileVisibility);
  };

  const toggleDataCollection = () => {
    setDataCollection(!dataCollection);
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage as any);
  };

  const tabs = [
    { id: 'profile', name: translate('profile') },
    { id: 'notifications', name: translate('notifications') },
    { id: 'security', name: translate('security') },
    { id: 'preferences', name: translate('preferences') }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('settings_title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{translate('settings_manage')}</p>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'profile' && <ProfileSettings />}
          
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{translate('notification_settings')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{translate('configure_notifications')}</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('email_notifications')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{translate('receive_email_updates')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleEmailNotifications}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        emailNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-pressed={emailNotifications}
                    >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('sms_notifications')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{translate('receive_text_messages')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSmsNotifications}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        smsNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-pressed={smsNotifications}
                    >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          smsNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('push_notifications')}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{translate('receive_browser_notifications')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePushNotifications}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        pushNotifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-pressed={pushNotifications}
                    >
                      <span className="sr-only">Use setting</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          pushNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="bg-white shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{translate('security_settings')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{translate('manage_account_security')}</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('change_password')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('update_password_regularly')}</p>
                    <button className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
                      {translate('change_password')}
                    </button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('two_factor_auth')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('add_extra_security')}</p>
                    <div className="mt-3 flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        twoFactorAuth 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {twoFactorAuth ? translate('enabled') : translate('disabled')}
                      </span>
                      <button 
                        onClick={toggleTwoFactorAuth}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                      >
                        {twoFactorAuth ? translate('disable') : translate('enable')}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('login_history')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('view_login_activity')}</p>
                    <div className="mt-3 bg-gray-50 p-4 rounded-md dark:bg-gray-700">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Chrome on Windows</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{translate('new_york')} • {translate('just_now')}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          {translate('current')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="bg-white shadow rounded-lg dark:bg-gray-800">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{translate('preferences_settings')}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{translate('customize_experience')}</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('language')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('choose_preferred_language')}</p>
                    <select 
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="ar">Arabic</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('theme')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('choose_preferred_theme')}</p>
                    <div className="mt-2 flex space-x-4">
                      <button 
                        onClick={() => changeTheme('light')}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          theme === 'light'
                            ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-gray-700 dark:border-indigo-400 dark:text-indigo-400'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                        }`}
                      >
                        Light
                      </button>
                      <button 
                        onClick={() => changeTheme('dark')}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          theme === 'dark'
                            ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-gray-700 dark:border-indigo-400 dark:text-indigo-400'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                        }`}
                      >
                        Dark
                      </button>
                      <button 
                        onClick={() => changeTheme('system')}
                        className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          theme === 'system'
                            ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-gray-700 dark:border-indigo-400 dark:text-indigo-400'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600'
                        }`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{translate('privacy')}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{translate('control_privacy_settings')}</p>
                    <div className="mt-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{translate('profile_visibility')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{translate('allow_users_see_profile')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={toggleProfileVisibility}
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            profileVisibility ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                          role="switch"
                          aria-pressed={profileVisibility}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                              profileVisibility ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{translate('data_collection')}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{translate('allow_collect_data')}</p>
                        </div>
                        <button
                          type="button"
                          onClick={toggleDataCollection}
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            dataCollection ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                          role="switch"
                          aria-pressed={dataCollection}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                              dataCollection ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}