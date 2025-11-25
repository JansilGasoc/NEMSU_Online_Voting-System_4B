export default function ApplicationLogo({ className = "" }) {
    return (
        <img
            src="/storage/logo/image.jpg"
            alt="Profile"
            className={`w-8 h-8 rounded-full mr-2 object-cover border border-gray-300 shadow-sm ${className}`}
        />
    );
}