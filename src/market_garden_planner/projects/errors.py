class ProjectError(ValueError):
    def __init__(self, code, message, status=422, **details):
        self.code, self.status, self.details = code, status, details
        super().__init__(message)
