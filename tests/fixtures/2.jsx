import logoUrl from "@/assets/images/redash_icon_small.png";
import { useCurrentRoute } from "@/components/ApplicationArea/Router";
import HelpTrigger from "@/components/HelpTrigger";
import Link from "@/components/Link";
import PlainButton from "@/components/PlainButton";
import CreateDashboardDialog from "@/components/dashboards/CreateDashboardDialog";
import CreateWorkbookDialog from "@/components/workbooks/CreateWorkbookDialog";
import { Auth } from "@/services/auth";
import settingsMenu from "@/services/settingsMenu";
import AlertOutlinedIcon from "@ant-design/icons/AlertOutlined";
import WorkbookIcon from "@ant-design/icons/BookOutlined";
import CodeOutlinedIcon from "@ant-design/icons/CodeOutlined";
import DesktopOutlinedIcon from "@ant-design/icons/DesktopOutlined";
import FolderOutlined from "@ant-design/icons/FolderOutlined";
import LineChartOutlined from "@ant-design/icons/LineChartOutlined";
import PlusOutlinedIcon from "@ant-design/icons/PlusOutlined";
import QuestionCircleOutlinedIcon from "@ant-design/icons/QuestionCircleOutlined";
import SettingOutlinedIcon from "@ant-design/icons/SettingOutlined";
import Menu from "antd/lib/menu";
import { first, includes } from "lodash";
import React, { useMemo } from "react";
import "./DesktopNavbar.less";
import VersionInfo from "./VersionInfo";

function NavbarSection({ children, ...props }) {
  return (
    <Menu selectable={false} mode="vertical" theme="dark" {...props}>
      {children}
    </Menu>
  );
}

function useNavbarActiveState() {
  const currentRoute = useCurrentRoute();

  return useMemo(
    () => ({
      workbooks: includes(
        [
          "Workbooks.Favorites",
          "Workbooks.List",
          "Workbooks.My",
          "Workbooks.ViewOrEdit",
          "Workbooks.Presets",
          "Workbooks.Presets.View",
        ],
        currentRoute.id
      ),
      dashboards: includes(
        [
          "Dashboards.Favorites",
          "Dashboards.LegacyViewOrEdit",
          "Dashboards.List",
          "Dashboards.My",
          "Dashboards.ViewOrEdit",
          "Dashboards.Presets",
          "Dashboards.Presets.View",
        ],
        currentRoute.id
      ),
      queries: includes(
        [
          "Queries.List",
          "Queries.Favorites",
          "Queries.Archived",
          "Queries.My",
          "Queries.View",
          "Queries.New",
          "Queries.Edit",
        ],
        currentRoute.id
      ),
      charts: includes(["charts"], currentRoute.id),
      dataSources: includes(["DataSources.List"], currentRoute.id),
      alerts: includes(["Alerts.List", "Alerts.New", "Alerts.View", "Alerts.Edit"], currentRoute.id),
      projects: includes(["Project.View", "Projects.Explore", "Projects.Explore.Favorites"], currentRoute.id),
    }),
    [currentRoute.id]
  );
}

export default function DesktopNavbar() {
  const firstSettingsTab = first(settingsMenu.getAvailableItems());

  const activeState = useNavbarActiveState();

  const canCreateQuery = Auth.hasPermission("create_query");
  const canCreateDashboard = Auth.hasPermission("create_dashboard");
  const canCreateAlert = Auth.hasPermission("list_alerts");

  return (
    <nav className="desktop-navbar">
      <NavbarSection className="desktop-navbar-logo">
        <div role="menuitem">
          <Link href="./">
            <img src={logoUrl} alt="Redash" />
          </Link>
        </div>
      </NavbarSection>

      <NavbarSection>
        <Menu.Item key="projects" className={activeState.projects ? "navbar-active-item" : null}>
          <Link href="/projects">
            <FolderOutlined />
            <span className="desktop-navbar-label">Projects</span>
          </Link>
        </Menu.Item>
        {Auth.hasPermission("list_dashboards") && (
          <Menu.Item key="workbooks" className={activeState.workbooks ? "navbar-active-item" : null}>
            <Link href="workbooks">
              <WorkbookIcon aria-label="Workbook navigation button" />
              <span className="desktop-navbar-label">Workbooks</span>
            </Link>
          </Menu.Item>
        )}
        {Auth.hasPermission("list_dashboards") && (
          <Menu.Item key="dashboards" className={activeState.dashboards ? "navbar-active-item" : null}>
            <Link href="dashboards">
              <DesktopOutlinedIcon aria-label="Dashboard navigation button" />
              <span className="desktop-navbar-label">Dashboards</span>
            </Link>
          </Menu.Item>
        )}
        {Auth.hasPermission("view_query") && (
          <Menu.Item key="queries" className={activeState.queries ? "navbar-active-item" : null}>
            <Link href="queries">
              <CodeOutlinedIcon aria-label="Queries navigation button" />
              <span className="desktop-navbar-label">Queries</span>
            </Link>
          </Menu.Item>
        )}
        <Menu.Item key="charts" className={activeState.charts ? "navbar-active-item" : null}>
          <Link href="charts">
            <LineChartOutlined />
            <span className="desktop-navbar-label">Charts</span>
          </Link>
        </Menu.Item>
        {Auth.hasPermission("list_alerts") && (
          <Menu.Item key="alerts" className={activeState.alerts ? "navbar-active-item" : null}>
            <Link href="alerts">
              <AlertOutlinedIcon aria-label="Alerts navigation button" />
              <span className="desktop-navbar-label">Alerts</span>
            </Link>
          </Menu.Item>
        )}
      </NavbarSection>

      <NavbarSection className="desktop-navbar-spacer">
        {(canCreateQuery || canCreateDashboard || canCreateAlert) && (
          <Menu.SubMenu
            key="create"
            popupClassName="desktop-navbar-submenu"
            data-test="CreateButton"
            tabIndex={0}
            title={
              <React.Fragment>
                <PlusOutlinedIcon />
                <span className="desktop-navbar-label">Create</span>
              </React.Fragment>
            }>
            {canCreateQuery && (
              <Menu.Item key="new-query">
                <Link href="queries/new" data-test="CreateQueryMenuItem">
                  New Query
                </Link>
              </Menu.Item>
            )}
            {canCreateDashboard && (
              <Menu.Item key="new-dashboard">
                <PlainButton data-test="CreateDashboardMenuItem" onClick={() => CreateDashboardDialog.showModal()}>
                  New Dashboard
                </PlainButton>
              </Menu.Item>
            )}
            {canCreateDashboard && (
              <Menu.Item key="new-workbook">
                <PlainButton data-test="CreateWorkbookMenuItem" onClick={() => CreateWorkbookDialog.showModal()}>
                  New Workbook
                </PlainButton>
              </Menu.Item>
            )}
            {canCreateAlert && (
              <Menu.Item key="new-alert">
                <Link data-test="CreateAlertMenuItem" href="alerts/new">
                  New Alert
                </Link>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        )}
      </NavbarSection>

      <NavbarSection>
        <Menu.Item key="help">
          <HelpTrigger showTooltip={false} type="HOME" tabIndex={0}>
            <QuestionCircleOutlinedIcon />
            <span className="desktop-navbar-label">Help</span>
          </HelpTrigger>
        </Menu.Item>
        {firstSettingsTab && (
          <Menu.Item key="settings" className={activeState.dataSources ? "navbar-active-item" : null}>
            <Link href={firstSettingsTab.path} data-test="SettingsLink">
              <SettingOutlinedIcon />
              <span className="desktop-navbar-label">Settings</span>
            </Link>
          </Menu.Item>
        )}
      </NavbarSection>

      <NavbarSection className="desktop-navbar-profile-menu">
        <Menu.SubMenu
          key="profile"
          popupClassName="desktop-navbar-submenu"
          tabIndex={0}
          title={
            <span data-test="ProfileDropdown" className="desktop-navbar-profile-menu-title">
              <img
                className="profile__image_thumb"
                src={Auth.session.user.profileImageUrl}
                alt={Auth.session.user.name}
              />
            </span>
          }>
          <Menu.Item key="profile">
            <Link href="users/me">Profile</Link>
          </Menu.Item>
          {Auth.hasPermission("super_admin") && (
            <Menu.Item key="status">
              <Link href="admin/status">System Status</Link>
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item key="logout">
            <PlainButton data-test="LogOutButton" onClick={() => Auth.logout()}>
              Log out
            </PlainButton>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="version" role="presentation" disabled className="version-info">
            <VersionInfo />
          </Menu.Item>
        </Menu.SubMenu>
      </NavbarSection>
    </nav>
  );
}