import threading
from abc import ABC, abstractmethod
from typing import Literal, TypedDict, Optional, cast

ModelType = Literal["depth_anything", "tiny_roma"]

class Spec(TypedDict):
    model_name: Optional[str]

class ModelManager(ABC):
    def __init__(self, model_type: ModelType, base_model: str):
        self.model_type = model_type
        self._lock = threading.RLock()
        self._current_model = None
        self._current_spec: Spec = {'model_name': None}

        self.select_model(base_model)

    def select_model(self, model_name: str) -> Spec:
        """
        Selects a model by its name and updates the current model and specification.
        :param model_name: str, name of the model to select
        :return: Spec, a dictionary containing the model specification
        """
        with self._lock:
            self._load_model(model_name)
            self._current_spec = cast(Spec, {'model_name': model_name})
        return self._current_spec.copy()

    def get_model(self):
        """
        Returns the currently selected model.
        """
        with self._lock:
            if self._current_model is None:
                raise RuntimeError(f"No {self.model_type} model selected yet")
            return self._current_model

    def get_spec(self) -> Spec:
        """
        Returns the specification of the currently selected model.
        :return: Spec, a dictionary containing the model specification
        """
        with self._lock:
            return self._current_spec.copy()

    @abstractmethod
    def _load_model(self, model_name: str) -> None:
        """
        Abstract method to load the model and its specification.
        Should be implemented by subclasses.
        """
        pass

    @abstractmethod
    def predict(self, *args, **kwargs):
        """
        Abstract method for making predictions with the currently selected model.
        """
        pass
