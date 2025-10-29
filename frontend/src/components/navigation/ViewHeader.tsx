interface ViewHeaderProps {
  activeView: 'chat' | 'friends' | 'settings' | 'notifications';
}

const ViewHeader = ({ activeView }: ViewHeaderProps) => {
  const getViewTitle = () => {
    switch (activeView) {
      case 'chat':
        return 'Trò chuyện';
      case 'friends':
        return 'Bạn bè';
      case 'notifications':
        return 'Thông báo';
      case 'settings':
        return 'Cài đặt';
      default:
        return 'ChatApp';
    }
  };

  return (
    <div className="md:hidden p-4 border-b border-border bg-card">
      <h1 className="text-lg font-semibold text-center">{getViewTitle()}</h1>
    </div>
  );
};

export default ViewHeader;